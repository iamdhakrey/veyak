<div align="center">
  
<img src="public/icon.png" alt="Veyak Logo - Fast, Native, Open-Source API Client" width="108" height="108" style="border-radius: 22px; box-shadow: 0 0 40px rgba(99, 102, 241, 0.45);" />

# Veyak API Client

### The Native, Blazing-Fast & Offline-First Multi-Protocol API Studio
**A modern, lightweight open-source alternative to Postman and Insomnia — powered by Rust and Tauri 2.**

[![GitHub Stars](https://img.shields.io/github/stars/iamdhakrey/veyak?style=for-the-badge&logo=github&color=FACC15)](https://github.com/iamdhakrey/veyak/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Tauri 2](https://img.shields.io/badge/Tauri-2.0-24C8D8?style=for-the-badge&logo=tauri&logoColor=white)](https://tauri.app/)
[![Rust Backend](https://img.shields.io/badge/Rust-1.75+-DEA584?style=for-the-badge&logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Linux%20%7C%20Windows-lightgrey?style=for-the-badge&logo=linux&logoColor=white)](https://veyak.iamdhakrey.dev/)

<p align="center">
  <a href="#why-veyak">Why Veyak?</a> •
  <a href="#core-features">Features</a> •
  <a href="#benchmark-comparison">Benchmarks</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#keyboard-shortcuts">Shortcuts</a> •
  <a href="https://veyak.iamdhakrey.dev/docs/">Docs</a>
</p>

<img width="100%" alt="Veyak Interface Preview - Clean, Native API Client" src="https://github.com/user-attachments/assets/4c71d4ee-7507-4fbe-a2ff-3fee55f5e4e4" />

</div>

---

## 🚀 Why Veyak?

Tired of slow, bloated API clients that consume **1 GB+ of RAM**, demand cloud accounts just to debug `localhost`, and crawl to a halt on large payloads?

**Veyak** is built from the ground up for speed, privacy, and developer ergonomics. By combining the safety and performance of **Rust (Tauri 2)** with a zero-bloat, native frontend running **React 19**, Veyak starts instantly and runs with a featherweight memory footprint.

- ⚡ **Instant Startup (< 100ms)** — No heavy Electron/Chromium overhead.
- 🪶 **Ultra-Low Memory (< 60MB RAM)** — Leaves your system resources free for your build tools and containers.
- 🔒 **100% Offline-First & Private** — Zero cloud lock-in, zero telemetry. Sensitive credentials stay encrypted inside your native **OS Keyring**.
- 🌐 **True Multi-Protocol Hub** — Seamlessly switch between **REST**, **gRPC**, **WebSocket**, and **GraphQL** in a single unified workspace.
- 🎨 **Featherweight Code Editor** — Powered by **CodeJar & PrismJS** for instant response times and syntax-highlighted speed.

---

## 📊 Benchmark Comparison

| Metric / Capability | Postman | Insomnia | ⚡ Veyak |
| :--- | :---: | :---: | :---: |
| **Engine / Runtime** | Electron (Chromium bundle) | Electron (Chromium bundle) | **Rust + Tauri 2 (Native Webview)** |
| **Memory Footprint (Idle)** | ~600 MB – 1.4 GB | ~400 MB – 900 MB | **< 60 MB** |
| **Cold Start Time** | 4.0s – 10.0s | 3.0s – 7.0s | **< 100 ms** |
| **Privacy & Storage** | Cloud-account enforced | Cloud sync default | **100% Local Files & OS Keyring** |
| **gRPC & Bidirectional Streaming** | Limited / Enterprise | Plugin / Basic | **Native Tonic/Prost engine** |
| **GraphQL Subscriptions** | Addon / Cloud | Limited | **Native WS/WSS Client + TLS Verifier** |
| **Code Editor Architecture** | Heavy Monaco editor | Monaco / Custom | **Ultra-lightweight CodeJar + PrismJS** |
| **Installation Size** | ~350 MB – 500 MB | ~200 MB – 300 MB | **< 20 MB Native Binary** |

---

## ✨ Core Features

### 🌐 Multi-Protocol Mastery

#### 1. REST / HTTP Client
- Complete HTTP verb coverage: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`.
- Dynamic query parameters, custom headers with autocompletion, and cookie inspection.
- Versatile body modes: **JSON**, **Multipart / Form-Data**, **URL-Encoded**, and **Raw Text**.
- Comprehensive authentication: **Bearer Token**, **Basic Auth**, and **API Key**.

#### 2. gRPC Studio (Unary & Streaming)
- Dynamic `.proto` schema reflection and file parsing powered by native Rust (`tonic` & `prost`).
- Supports all 4 gRPC communication patterns:
  - **Unary Calls**
  - **Server Streaming**
  - **Client Streaming**
  - **Bidirectional Streaming**
- Live message feed with timestamped frames, status code badges, and trailing metadata.

#### 3. WebSocket Inspector
- Persistent bi-directional connection manager (`ws://` and `wss://`).
- Real-time event log with inbound/outbound frame indicators.
- Saved message presets for rapid testing and repeated frame dispatching.
- Sub-protocol awareness (including `graphql-ws`).

#### 4. GraphQL Explorer & Subscriptions
- Interactive query, mutation, and variable editor with real-time response rendering.
- **Real-Time Subscriptions** over WebSockets with configurable SSL/TLS certificate verification (ideal for local development and self-signed certificates).
- Schema introspection drawer with one-click operation generator.

---

### 🛠️ Developer-First Ergonomics

- 🗂️ **Workspaces & Collections**: Organize endpoints into nested folders with instant search.
- 📋 **Request Duplication & Management**: One-click request cloning, renaming, and tab reordering.
- ⚡ **Dynamic Environment Variables**: Interpolate variables dynamically using `{{base_url}}` syntax across headers, URLs, and payloads with instant environment swapping.
- ⌨️ **Command Palette (`Cmd/Ctrl + P` or `Cmd/Ctrl + K`)**: Keyboard-centric navigation across all requests, collections, and settings.
- 🕒 **Interactive History Drawer**: Full chronological audit log of sent requests and received responses.
- 🔐 **Secure OS Keyring Integration**: Master tokens and authentication secrets are preserved safely using native OS keychains rather than plain text.
- 🎨 **Typography & Theme Controls**: Tailor the app interface with customizable UI and monospace fonts (Fira Code, JetBrains Mono, Inter, and more).

---

## ⌨️ Keyboard Shortcuts

Speed up your API testing workflow with native keybindings:

| Action | macOS | Windows / Linux |
| :--- | :---: | :---: |
| **Send / Execute Request** | <kbd>⌘</kbd> + <kbd>Enter</kbd> | <kbd>Ctrl</kbd> + <kbd>Enter</kbd> |
| **Save Request** | <kbd>⌘</kbd> + <kbd>S</kbd> | <kbd>Ctrl</kbd> + <kbd>S</kbd> |
| **New Tab** | <kbd>⌘</kbd> + <kbd>T</kbd> | <kbd>Ctrl</kbd> + <kbd>T</kbd> |
| **Open Command Palette** | <kbd>⌘</kbd> + <kbd>P</kbd> or <kbd>K</kbd> | <kbd>Ctrl</kbd> + <kbd>P</kbd> or <kbd>K</kbd> |
| **Toggle Request History** | <kbd>⌘</kbd> + <kbd>H</kbd> | <kbd>Ctrl</kbd> + <kbd>H</kbd> |
| **Open Settings** | <kbd>⌘</kbd> + <kbd>,</kbd> | <kbd>Ctrl</kbd> + <kbd>,</kbd> |

---

## 📦 Getting Started (Local Development)

### Prerequisites

1. **Node.js** (v18+) or **[Bun](https://bun.sh/)** (recommended for speed)
2. **[Rust](https://www.rust-lang.org/tools/install)** (v1.75 or later)
3. **Platform Build Dependencies**:
   - **Debian / Ubuntu**:
     ```bash
     sudo apt update && sudo apt install -y libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
     ```
   - **Fedora**:
     ```bash
     sudo dnf check-update && sudo dnf install -y webkit2gtk4.1-devel openssl-devel curl wget file libappindicator-gtk3-devel librsvg2-devel
     ```
   - **macOS**:
     ```bash
     xcode-select --install
     ```
   - **Windows**:
     Install the [C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) and [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/).

---

### Installation & Running

1. **Clone the repository:**
   ```bash
   git clone https://github.com/iamdhakrey/veyak.git
   cd veyak
   ```

2. **Install frontend and crate dependencies:**
   ```bash
   bun install
   # or: npm install / pnpm install
   ```

3. **Start the local development server:**
   ```bash
   bun run tauri dev
   # or: npm run tauri dev
   ```

---

### Building for Production

Compile a fully optimized, native standalone package for your operating system (`.deb`, `.AppImage`, `.dmg`, or `.msi`):

```bash
bun run tauri build
# or: npm run tauri build
```

The generated install bundles will be located in:
```text
src-tauri/target/release/bundle/
```

---

## 🤝 Contributing

We welcome contributions of all kinds — bug fixes, UI/UX polish, new protocol integrations, and documentation improvements!

1. **Fork** the repository.
2. **Create a feature branch**:
   ```bash
   git checkout -b feat/my-new-feature
   ```
3. **Commit your changes**:
   ```bash
   git commit -m "feat: add support for MQTT protocol"
   ```
4. **Push to your branch**:
   ```bash
   git push origin feat/my-new-feature
   ```
5. Open a **Pull Request** with a description of your work.

---

## 🌟 Show Your Support

If Veyak helps you build and test APIs faster, please consider giving us a **Star (⭐️)** on [GitHub](https://github.com/iamdhakrey/veyak)! It boosts discovery and motivates continuous innovation.

---

## 📄 License & Author

Distributed under the **MIT License**. See [LICENSE](LICENSE) for details.

Crafted with ❤️ by **Hrithik Dhakrey**  
- **GitHub**: [@iamdhakrey](https://github.com/iamdhakrey)  
- **Website & Docs**: [veyak.iamdhakrey.dev](https://veyak.iamdhakrey.dev/)

