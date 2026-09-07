use std::collections::HashMap;
use std::sync::Arc;

use tokio::sync::{mpsc, Mutex};
use tokio_tungstenite::tungstenite::Message;

use veyak_db::DataDir;
use veyak_graphql::state::GraphQlState;
use veyak_grpc::state::GrpcState;

/// In-memory map of active WebSocket connections, keyed by connection id.
pub type WsTx = mpsc::UnboundedSender<Message>;
pub type WsConnections = Arc<Mutex<HashMap<String, WsTx>>>;

pub struct AppState {
    pub data_dir: DataDir,
    pub ws_connections: WsConnections,
    pub grpc_state: GrpcState,
    pub graphql_state: GraphQlState,
}
