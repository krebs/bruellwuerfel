# 🔊 Bruellwürfel

**Bruellwürfel** (German for "roaring cube" or "shout box") is a lightweight IRC-to-web gateway that bridges IRC channels with a modern web-based shoutbox interface. Built with Deno and TypeScript, it allows users to participate in IRC conversations through a simple web interface without needing an IRC client.

[![Deno](https://img.shields.io/badge/deno-%5E1.0-green?logo=deno)](https://deno.land/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.x-blue?logo=typescript)](https://www.typescriptlang.org/)

## ✨ Features

- **🌐 Web-to-IRC Bridge**: Post messages to IRC channels directly from your browser
- **💬 Real-time Updates**: Messages refresh automatically every 500ms for a live chat experience
- **🔒 Anonymous Authentication**: Generates unique user IDs based on browser fingerprints (User-Agent, Accept-Language, Accept-Encoding)
- **💾 Message Persistence**: Automatically saves and restores chat history to disk
- **🎨 Simple Interface**: Minimalist web UI with no dependencies or complex setup
- **⚡ Powered by Deno**: Leverages Deno's secure runtime and modern JavaScript features
- **🔧 Highly Configurable**: Environment-based configuration for easy deployment

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  Web Client │ ◄─────► │ Bruellwürfel │ ◄─────► │ IRC Channel │
│  (Browser)  │   HTTP  │   (Deno)     │   IRC   │             │
└─────────────┘         └──────────────┘         └─────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │ history.json │
                        │ (Persistence)│
                        └──────────────┘
```

### Components

- **Web Server (Oak)**: REST API serving HTML/JS and handling message endpoints
- **IRC Client**: Connects to IRC servers and relays messages bidirectionally
- **Persistence Layer**: Saves/loads message history from JSON file
- **Username Generator**: Creates anonymous identifiers from HTTP headers

## 📋 Prerequisites

- [Deno](https://deno.land/) 1.0 or higher
- Access to an IRC server (optional: for testing, you can use a local IRC server)

### Installation

#### Using Nix (Recommended)

If you have [Nix](https://nixos.org/) installed:

```bash
nix-shell
```

#### Manual Installation

Install Deno from [deno.land](https://deno.land/):

```bash
# macOS/Linux
curl -fsSL https://deno.land/install.sh | sh

# Windows
iwr https://deno.land/install.ps1 -useb | iex
```

## 🚀 Usage

### Quick Start

1. Clone the repository:
```bash
git clone https://github.com/krebs/bruellwuerfel.git
cd bruellwuerfel
```

2. Run the application:
```bash
deno run --allow-net --allow-read --allow-write --allow-env src/index.ts
```

3. Open your browser and navigate to `http://localhost:3000/index.html`

### Configuration

Configure Bruellwürfel using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `REST_PORT` | HTTP server port | `3000` |
| `IRC_SERVER` | IRC server address | `irc.r` |
| `IRC_PORT` | IRC server port | `6667` |
| `IRC_CHANNEL` | IRC channel to join | `#flix` |
| `IRC_NICK` | Bot nickname | `bruellwuerfel` |
| `IRC_HISTORY_FILE` | Path to persistence file | `history.json` |

### Example with Custom Configuration

```bash
REST_PORT=8080 \
IRC_SERVER=irc.libera.chat \
IRC_PORT=6667 \
IRC_CHANNEL=#your-channel \
IRC_NICK=mybot \
deno run --allow-net --allow-read --allow-write --allow-env src/index.ts
```



## 🔌 API Reference

### Endpoints

#### `GET /messages`

Retrieve message history.

**Query Parameters:**
- `limit` (optional): Number of recent messages to return

**Response:**
```json
[
  {
    "sender": "abc",
    "text": "Hello, world!"
  }
]
```

#### `POST /messages`

Post a new message to the IRC channel.

**Request Body:**
```json
{
  "message": "Hello from the web!"
}
```

**Response:** Empty (200 OK)

#### `GET /index.html`

Serves the web interface HTML.

#### `GET /index.js`

Serves the client-side JavaScript for the shoutbox.

## 🛠️ Development

### Project Structure

```
bruellwuerfel/
├── src/
│   ├── index.ts          # Main application entry point
│   ├── irc.ts            # IRC client wrapper
│   ├── persistence.ts    # Message history persistence
│   ├── types.ts          # TypeScript type definitions
│   └── templates/
│       ├── html.ts       # HTML template
│       └── javascript.ts # Client-side JS template
├── public/
│   └── index.html        # Development iframe wrapper
├── shell.nix             # Nix development environment
└── .gitignore
```

### Running in Development Mode

For development with auto-reload, you can use Deno's watch mode:

```bash
deno run --watch --allow-net --allow-read --allow-write --allow-env src/index.ts
```

### Code Overview

**Main Components:**

1. **`src/index.ts`**: 
   - Sets up Oak web server
   - Defines REST API routes
   - Handles message persistence on shutdown
   - Generates anonymous usernames from browser fingerprints

2. **`src/irc.ts`**: 
   - Manages IRC connection
   - Sends messages to IRC channel
   - Listens for incoming IRC messages

3. **`src/persistence.ts`**: 
   - Saves chat history to JSON file
   - Loads history on startup

4. **`src/templates/`**: 
   - Contains inline HTML and JavaScript templates
   - Provides minimal shoutbox interface

### Anonymous User Identification

The system generates anonymous user IDs by hashing:
- User-Agent header
- Accept-Language header
- Accept-Encoding header

This creates consistent identifiers across sessions without requiring login.

## 🐛 Known Issues & Future Enhancements

**Current Limitations:**
- Message history grows unbounded (consider implementing rotation/limits)
- No authentication or rate limiting on message posting
- IRC connection errors are not gracefully handled in the UI
- Anonymous user identification can be spoofed by changing headers

**Planned Improvements:**
- [ ] Add WebSocket support for real-time updates (eliminate polling)
- [ ] Implement message history pagination
- [ ] Add rate limiting and spam protection
- [ ] Support multiple IRC channels
- [ ] Add optional user authentication
- [ ] Improve error handling and reconnection logic
- [ ] Add unit and integration tests
- [ ] Create Docker deployment configuration
- [ ] Add CSS styling for better UI/UX

## 💡 Use Cases

- **Community Shoutbox**: Embed an IRC-backed shoutbox on your website
- **IRC Gateway**: Allow non-technical users to participate in IRC channels
- **Event Chat**: Temporary chat solution for events or gatherings
- **Retro Chat**: Nostalgic shoutbox experience with modern infrastructure
