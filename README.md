<div align="center">
  
  
<img src="public/icon.png" alt="Veyak Icon" width="100" height="100" style="border-radius: 20px; box-shadow: 0 0 35px rgba(99, 102, 241, 0.4);" />

# Veyak API Client

**The Blazing-Fast, Lightweight, Native Multi-Protocol API Client.**

[![GitHub Stars](https://img.shields.io/github/stars/iamdhakrey/veyak?style=for-the-badge&logo=github&color=FACC15)](https://github.com/iamdhakrey/veyak/stargazers)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Tauri 2](https://img.shields.io/badge/Tauri-2.0-24C8D8?style=for-the-badge&logo=tauri&logoColor=white)](https://tauri.app/)
[![Rust](https://img.shields.io/badge/Rust-Backend-DEA584?style=for-the-badge&logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)

<p align="center">
  <a href="#why-veyak">Why Veyak?</a> •
  <a href="https://veyak.iamdhakrey.dev/">Key Features</a> •
  <a href="https://veyak.iamdhakrey.dev/docs/">Tech Stack</a> •
  <a href="https://veyak.iamdhakrey.dev/docs/getting-started/">Getting Started</a> •
  <a href="https://veyak.iamdhakrey.dev/docs/contributing/">Contributing</a> •
  <a href="https://veyak.iamdhakrey.dev/docs/">Documentation</a>
</p>

*Veyak API Client* is engineered for seamless, frictionless communication between clients and modern APIs.

<img width="1198" height="830" alt="image" src="https://github.com/user-attachments/assets/f2e6c1d5-4a8f-4d05-a6fc-5000afe164e7" />


---

</div>

## Why Veyak?

Tired of clunky API clients that consume 1 GB+ of RAM, take 10 seconds to open, and force cloud logins just to test a local endpoint? 

**Veyak is engineered differently:**

| Feature | Postman / Insomnia | ⚡ Veyak |
| :--- | :--- | :--- |
| **Engine** | Electron (Heavy Chromium bundle) | **Rust + Tauri 2 (Native OS Webview)** |
| **Memory Footprint** | ~500 MB – 1.2 GB RAM | **< 60 MB RAM** |
| **Startup Time** | 4 – 10 seconds | **< 100 milliseconds** |
| **Protocols** | Plugin/Tier-dependent | **REST, gRPC, WebSockets & GraphQL** |
| **Data Privacy** | Cloud-forced sync | **100% Offline-first (Local Files)** |
| **Code Editor** | Basic text inputs | **Ultra-lightweight CodeJar & PrismJS Editor** |

---

## Key Features

### Multi-Protocol Mastery
- **REST / HTTP**: Full support for `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`.
- **gRPC Studio**: 
  - Dynamic `.proto` file parsing and reflection.
  - Comprehensive streaming: **Unary**, **Client Streaming**, **Server Streaming**, and **Bidirectional Streaming**.
  - Detailed metadata, headers, trailers, and status code inspection.
- **WebSocket Inspector**:
  - Live WS/WSS connection manager.
  - Interactive bi-directional frame messaging with JSON formatting and message history.
- **GraphQL Explorer(In-Progress)**:
  - Write queries, mutations, and variables with real-time payload previews.

### Modern Developer Experience
- **Command Palette (`Cmd/Ctrl + K`)**: Instant keyboard-driven navigation across tabs, requests, collections, and tools.
- **Ultra-Sleek Titlebar Breadcrumb**: Switch Workspaces, Collections, and Environments in a single click straight from the header.
- **Lightweight Code Editor**: Powered by CodeJar & PrismJS — zero-bloat micro editor with instant startup, synchronized line numbers, and dark syntax highlighting.
- **Dynamic Environment Variables**: Seamless interpolation with `{{variable}}` syntax, secret masking, and instant environment swapping.
- **Workspaces & Nested Collections**: Organize endpoints into deep folder hierarchies with intuitive tab management.
- **Privacy First**: Your requests and environment variables stay on your machine.

---

## Tech Stack

<div align="center">

```
┌─────────────────────────────────────────────────────────┐
│                     VEYAK ARCHITECTURE                  │
├────────────────────────────┬────────────────────────────┤
│         FRONTEND           │          BACKEND           │
│   • React 19               │   • Tauri 2.0 (Rust)       │
│   • TypeScript             │   • Tokio (Async Runtime)  │
│   • Tailwind CSS 4         │   • Reqwest (HTTP Engine)  │
│   • CodeJar & PrismJS      │   • Tonic / Prost (gRPC)   │
│   • Zustand (State Engine) │   • Local Storage          │
└────────────────────────────┴────────────────────────────┘
```

</div>

---

## Getting Started

### Prerequisites
Make sure you have installed:
- [Node.js](https://nodejs.org/) (v18+) or [Bun](https://bun.sh/)
- [Rust](https://www.rust-lang.org/tools/install) (1.75+)
- Platform build essentials (e.g., Xcode Command Line Tools on macOS, `build-essential` on Linux)

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/iamdhakrey/veyak.git
   cd veyak
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or: npm install / pnpm install / yarn
   ```

3. **Run in Development Mode**
   ```bash
   bun run tauri dev
   # or: npm run tauri dev
   ```

### Building for Production

To create an optimized, native desktop binary (`.dmg`, `.deb`/`.AppImage`, or `.msi`/`.exe`):

```bash
bun run tauri build
```

The output bundle will be generated in `src-tauri/target/release/bundle/`.

---

## Contributing

Contributions make the open-source community thrive! Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feat/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feat/AmazingFeature`)
5. Open a Pull Request

---

## Show Your Support

If you love the idea of a lightning-fast, native, privacy-first API client, please give **Veyak** a **Star (⭐️)**! It helps the project grow and motivates ongoing development.

---

## Author

**Hrithik Dhakrey**  
- GitHub: [@iamdhakrey](https://github.com/iamdhakrey)
