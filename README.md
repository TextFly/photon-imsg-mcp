# Photon iMessage MCP Server

An MCP server implementation that integrates the Photon iMessage SDK, providing AI agents with the ability to read, send, and automate iMessage conversations.

## Features

- **Send Messages**: Send iMessages to phone numbers or email addresses
- **Read Messages**: Retrieve message history from conversations
- **List Conversations**: Get all active iMessage conversations
- **Conversation Details**: Get detailed information about specific conversations
- **Dual Transport**: Supports both STDIO (local) and HTTP (production) transports

## Tools

### `photon_send_message`
Sends an iMessage to a recipient.

**Inputs:**
- `recipient` (string, required): Phone number (e.g., '+1234567890') or email address
- `text` (string, required): Message text to send
- `chatId` (string, optional): Chat ID if continuing an existing conversation

### `photon_read_messages`
Reads messages from an iMessage conversation.

**Inputs:**
- `chatId` (string, optional): Chat/conversation ID
- `recipient` (string, optional): Recipient phone number or email
- `limit` (number, optional): Maximum number of messages (default: 50)
- `offset` (number, optional): Number of messages to skip (default: 0)

### `photon_get_conversations`
Gets a list of all iMessage conversations.

**Inputs:**
- `limit` (number, optional): Maximum number of conversations (default: 50)
- `offset` (number, optional): Number of conversations to skip (default: 0)

### `photon_get_conversation_details`
Gets detailed information about a specific conversation.

**Inputs:**
- `chatId` (string, required): Chat/conversation ID

## Installation

### Prerequisites

- **Bun** (recommended for zero dependencies) - Install from [bun.sh](https://bun.sh)
- Or **Node.js 18+** with npm/yarn
- macOS (required for iMessage functionality)

### Install Dependencies

```bash
# Using Bun (recommended - zero dependencies)
bun install

# Or using npm/yarn (requires better-sqlite3)
npm install
# or
yarn install
```

## Configuration

### Usage with Claude Desktop

Add this to your `claude_desktop_config.json`:

#### STDIO Transport (Local)

```json
{
  "mcpServers": {
    "photon-imsg": {
      "command": "bun",
      "args": ["run", "/path/to/photon-imsg-mcp/src/index.ts"]
    }
  }
}
```

#### HTTP Transport

```json
{
  "mcpServers": {
    "photon-imsg": {
      "command": "bun",
      "args": ["run", "/path/to/photon-imsg-mcp/src/index.ts", "--port", "3002"],
      "url": "http://localhost:3002/mcp"
    }
  }
}
```

### Usage with VS Code

Add the following JSON block to your User Settings (JSON) file in VS Code. You can do this by pressing `Ctrl + Shift + P` and typing `Preferences: Open User Settings (JSON)`.

```json
{
  "mcp": {
    "inputs": [],
    "servers": {
      "photon-imsg": {
        "command": "bun",
        "args": ["run", "/absolute/path/to/photon-imsg-mcp/src/index.ts"]
      }
    }
  }
}
```

## Development

### Running the Server

```bash
# STDIO transport (default)
bun run src/index.ts

# HTTP transport
bun run src/index.ts --port 3002

# Or using npm scripts
npm run dev:stdio
npm run dev:http
```

### Building

```bash
# Build TypeScript
bun run build

# Or
npm run build
```

### Testing with MCP Inspector

```bash
npm run inspector
```

## Project Structure

```
photon-imsg-mcp/
├── src/
│   ├── index.ts           # Main entry point
│   ├── server.ts          # MCP server implementation
│   ├── client.ts          # Photon SDK client wrapper
│   ├── config.ts          # Configuration management
│   ├── cli.ts             # CLI argument parsing
│   ├── types.ts           # TypeScript type definitions
│   ├── tools/
│   │   ├── index.ts       # Tool exports
│   │   └── imessage.ts    # iMessage tool definitions
│   └── transport/
│       ├── index.ts       # Transport exports
│       ├── stdio.ts       # STDIO transport
│       └── http.ts         # HTTP transport
├── package.json
├── tsconfig.json
└── README.md
```

## Notes

- This server requires macOS to access iMessage functionality
- The Photon SDK handles all iMessage database access
- Make sure you have proper permissions to access Messages on macOS
- The SDK uses Bun for zero dependencies, but can work with Node.js

## License

MIT License - see LICENSE file for details.
