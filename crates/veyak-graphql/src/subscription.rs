use futures_util::{SinkExt, StreamExt};
use rustls::{
    client::danger::{HandshakeSignatureValid, ServerCertVerifier},
    pki_types::{CertificateDer, ServerName, UnixTime},
    ClientConfig,
};
use rustls::{Error, SignatureScheme};
use std::{collections::BTreeMap, sync::Arc};
use tokio::sync::mpsc;
use tokio_tungstenite::{
    connect_async_tls_with_config,
    tungstenite::{client::IntoClientRequest as _, Message},
    Connector,
};
use tokio_util::sync::CancellationToken;
use uuid::Uuid;
use veyak_error::{AppError, AppResult};
use veyak_models::AppSettings;

/// Event sent from the subscription read loop to the Tauri command layer.
#[derive(Debug, Clone)]
pub struct GraphQlEvent {
    pub event_type: String, // "connecting" | "data" | "error" | "complete"
    pub payload: String,    // JSON string
}

/// A running subscription handle that the command layer can drive.
pub struct SubscriptionHandle {
    pub connection_id: String,
    pub cancel_token: CancellationToken,
    pub rx: mpsc::UnboundedReceiver<GraphQlEvent>,
}

#[derive(Debug)]
struct NoCertificateVerification;

impl ServerCertVerifier for NoCertificateVerification {
    fn verify_server_cert(
        &self,
        _end_entity: &CertificateDer<'_>,
        _intermediates: &[CertificateDer<'_>],
        _server_name: &ServerName<'_>,
        _ocsp_response: &[u8],
        _now: UnixTime,
    ) -> Result<rustls::client::danger::ServerCertVerified, Error> {
        Ok(rustls::client::danger::ServerCertVerified::assertion())
    }

    fn verify_tls12_signature(
        &self,
        _message: &[u8],
        _cert: &CertificateDer<'_>,
        _dss: &rustls::DigitallySignedStruct,
    ) -> Result<HandshakeSignatureValid, Error> {
        Ok(HandshakeSignatureValid::assertion())
    }

    fn verify_tls13_signature(
        &self,
        _message: &[u8],
        _cert: &CertificateDer<'_>,
        _dss: &rustls::DigitallySignedStruct,
    ) -> Result<HandshakeSignatureValid, Error> {
        Ok(HandshakeSignatureValid::assertion())
    }

    fn supported_verify_schemes(&self) -> Vec<SignatureScheme> {
        rustls::crypto::aws_lc_rs::default_provider()
            .signature_verification_algorithms
            .supported_schemes()
    }
}

fn build_ws_client(setting: &AppSettings) -> AppResult<Connector> {
    let mut config = ClientConfig::builder()
        .with_root_certificates(rustls::RootCertStore::empty())
        .with_no_client_auth();

    if !setting.verify_ssl_certificates {
        config
            .dangerous()
            .set_certificate_verifier(Arc::new(NoCertificateVerification));
    };

    // 3. Wrap it inside tokio_tungstenite's Connector enum
    let connector = Connector::Rustls(Arc::new(config));
    Ok(connector)
}

fn check_is_secure_ws(url: String) -> bool {
    return url.starts_with("wss");
}

/// Upgrade a `ws://` or `http://` URL to the appropriate WebSocket scheme.
fn to_ws_url(url: &str) -> String {
    if url.starts_with("http://") {
        url.replacen("http://", "ws://", 1)
    } else if url.starts_with("https://") {
        url.replacen("https://", "wss://", 1)
    } else {
        url.to_string()
    }
}

/// Start a `graphql-ws` protocol subscription.
///
/// Establishes the WebSocket, performs `connection_init` → `subscribe` handshake,
/// then spawns a background task that feeds events into an unbounded mpsc channel.
/// The caller (Tauri command) owns the receiver and forwards events to the UI.
///
/// Returns a [`SubscriptionHandle`] with the `connection_id`, a
/// `CancellationToken`, and the event receiver.
pub async fn start_subscription(
    endpoint: &str,
    query: &str,
    variables: Option<serde_json::Value>,
    operation_name: Option<String>,
    _headers: BTreeMap<String, String>,
    settings: AppSettings,
) -> AppResult<SubscriptionHandle> {
    let ws_url = to_ws_url(endpoint);
    let connection_id = Uuid::new_v4().to_string();
    let cancel_token = CancellationToken::new();
    let cancel_clone = cancel_token.clone();
    let (tx, rx) = mpsc::unbounded_channel::<GraphQlEvent>();

    // Build the WebSocket request with the graphql-ws sub-protocol.
    // let request = http::Request::builder()
    //     .uri(&ws_url)
    //     .header("Sec-WebSocket-Protocol", "graphql-ws")
    //     .header("User-Agent", "Veyak/0.1")
    //     .body(())
    //     .map_err(|e| AppError::GraphQlError(format!("Failed to build WS request: {e}")))?;

    let mut request = ws_url
        .as_str()
        .into_client_request()
        .map_err(|e| AppError::GraphQlError(format!("Failed to build WS request: {e}")))?;
    request.headers_mut().insert(
        "Sec-WebSocket-Protocol",
        "graphql-transport-ws".parse().unwrap(),
    );
    request
        .headers_mut()
        .insert("User-Agent", "Veyak/0.1".parse().unwrap());

    let connector = build_ws_client(&settings)?;
    let (ws_stream, _) = if check_is_secure_ws(ws_url.clone()) {
        connect_async_tls_with_config(
            request,
            None,  // Use default WebSocketConfig
            false, // Do not disable Nagle's algorithm
            Some(connector),
        )
        .await
        .map_err(|e| AppError::WebSocket(format!("TLS connection failed: {e}")))?
    } else {
        tokio_tungstenite::connect_async(request)
            .await
            .map_err(|e| AppError::WebSocket(format!("connection failed: {e}")))?
    };

    // let (ws_stream, _) = connect_async_tls_with_config(request, None, false, None)
    //     .await
    //     .map_err(|e| AppError::GraphQlError(format!("WebSocket connection failed: {e}")))?;

    let (mut write, mut read) = ws_stream.split();

    // ── graphql-ws handshake ─────────────────────────────────────────
    // 1. Send connection_init
    let init_msg = serde_json::json!({ "type": "connection_init", "payload": {} });
    write
        .send(Message::Text(init_msg.to_string().into()))
        .await
        .map_err(|e| AppError::GraphQlError(format!("Failed to send connection_init: {e}")))?;

    // 2. Wait for connection_ack
    loop {
        match read.next().await {
            Some(Ok(Message::Text(txt))) => {
                let val: serde_json::Value = serde_json::from_str(&txt).unwrap_or_default();
                if val.get("type").and_then(|t| t.as_str()) == Some("connection_ack") {
                    break;
                }
            }
            Some(Err(e)) => {
                return Err(AppError::GraphQlError(format!(
                    "WS error during handshake: {e}"
                )));
            }
            None => {
                return Err(AppError::GraphQlError(
                    "WebSocket closed before connection_ack".into(),
                ));
            }
            _ => {}
        }
    }

    // 3. Send the subscribe message
    let mut payload = serde_json::json!({ "query": query });
    if let Some(vars) = variables {
        payload["variables"] = vars;
    }
    let resolved_op = if let Some(op) = operation_name {
        if !op.trim().is_empty() {
            Some(op)
        } else {
            None
        }
    } else {
        None
    };

    let _ = resolved_op.or_else(|| {
        let ops = crate::client::extract_operation_names(query);
        ops.first().map(|(_, name)| name.clone())
    });

    // if let Some(op) = op_to_send {
    //     payload["operationName"] = serde_json::Value::String(op);
    // }

    let sub_id = Uuid::new_v4().to_string();
    let subscribe_msg = serde_json::json!({
        "id": sub_id,
        "type": "subscribe",
        "payload": payload,
    });

    write
        .send(Message::Text(subscribe_msg.to_string().into()))
        .await
        .map_err(|e| AppError::GraphQlError(format!("Failed to send subscribe: {e}")))?;

    // 4. Spawn the event-driven read loop — sends events into the mpsc channel
    tokio::spawn(async move {
        // Signal UI that the subscription is live
        let _ = tx.send(GraphQlEvent {
            event_type: "connecting".to_string(),
            payload: "{}".to_string(),
        });

        loop {
            tokio::select! {
                _ = cancel_clone.cancelled() => {
                    // Send complete to server
                    let stop_msg = serde_json::json!({ "id": sub_id, "type": "complete" });
                    let _ = write.send(Message::Text(stop_msg.to_string().into())).await;
                    let _ = tx.send(GraphQlEvent {
                        event_type: "complete".to_string(),
                        payload: "{}".to_string(),
                    });
                    break;
                }
                msg = read.next() => {
                    match msg {
                        Some(Ok(Message::Text(txt))) => {
                            let val: serde_json::Value =
                                serde_json::from_str(&txt).unwrap_or_default();
                            let msg_type = val
                                .get("type")
                                .and_then(|t| t.as_str())
                                .unwrap_or("")
                                .to_string();

                            match msg_type.as_str() {
                                "next" => {
                                    let p = val
                                        .get("payload")
                                        .map(|p| serde_json::to_string_pretty(p).unwrap_or_default())
                                        .unwrap_or_default();
                                    let _ = tx.send(GraphQlEvent {
                                        event_type: "data".to_string(),
                                        payload: p,
                                    });
                                }
                                "error" => {
                                    let p = val
                                        .get("payload")
                                        .map(|p| serde_json::to_string_pretty(p).unwrap_or_default())
                                        .unwrap_or_default();
                                    let _ = tx.send(GraphQlEvent {
                                        event_type: "error".to_string(),
                                        payload: p,
                                    });
                                }
                                "complete" => {
                                    let _ = tx.send(GraphQlEvent {
                                        event_type: "complete".to_string(),
                                        payload: "{}".to_string(),
                                    });
                                    break;
                                }
                                "data" => {
                                    let p = val
                                        .get("payload")
                                        .map(|p| serde_json::to_string_pretty(p).unwrap_or_default())
                                        .unwrap_or_default();
                                    let _ = tx.send(GraphQlEvent {
                                        event_type: "data".to_string(),
                                        payload: p,
                                    });
                                }
                                _ => {
                                    let p = val
                                        .get("payload")
                                        .map(|p| serde_json::to_string_pretty(p).unwrap_or_default())
                                        .unwrap_or_default();
                                    let _ = tx.send(GraphQlEvent {
                                        event_type: "data".to_string(),
                                        payload: p,
                                    });
                                }
                            }
                        }
                        Some(Ok(Message::Close(_))) | None => {
                            let _ = tx.send(GraphQlEvent {
                                event_type: "complete".to_string(),
                                payload: "{}".to_string(),
                            });
                            break;
                        }
                        Some(Err(e)) => {
                            let _ = tx.send(GraphQlEvent {
                                event_type: "error".to_string(),
                                payload: format!("\"{}\"", e),
                            });
                            break;
                        }
                        Some(Ok(Message::Ping(_))) => {
                            let _ = tx.send(GraphQlEvent {
                                event_type: "ping".to_string(),
                                payload: "{}".to_string(),
                            });
                        }
                        _ => {}
                    }
                }
            }
        }
    });

    Ok(SubscriptionHandle {
        connection_id,
        cancel_token,
        rx,
    })
}
