# Photon SDK API Integration Notes

This file contains notes about integrating with the `@photon-ai/imessage-kit` SDK.

## Current Implementation Assumptions

The current `src/client.ts` file makes assumptions about the Photon SDK API. You may need to adjust the following based on the actual SDK:

### 1. Import Statement
```typescript
import PhotonKit from '@photon-ai/imessage-kit';
```
- Adjust if the SDK uses named exports or a different default export

### 2. Initialization
```typescript
this.client = new PhotonKit();
```
- May need to pass configuration options
- May use a factory function instead of constructor

### 3. Method Names
The following methods are assumed:
- `client.sendMessage({ recipient, text, chatId })`
- `client.getMessages({ chatId, recipient, limit, offset })`
- `client.getConversations({ limit, offset })`
- `client.getConversation(chatId)`

### 4. Return Types
The SDK methods are expected to return:
- `sendMessage`: `{ id: string }` or similar
- `getMessages`: Array of message objects with `{ id, text, date, isFromMe, handle }`
- `getConversations`: Array of conversation objects with `{ id, displayName, participants, lastMessage, unreadCount }`
- `getConversation`: Single conversation object

## How to Update

1. Check the `@photon-ai/imessage-kit` documentation or source code
2. Update `src/client.ts` with the correct:
   - Import statement
   - Initialization code
   - Method names
   - Parameter structures
   - Return type handling

3. Update the type definitions in `src/types.ts` if needed

4. Test each tool to ensure proper integration

## Testing

After updating the client, test with:
```bash
bun run dev:stdio
# Then use MCP inspector or Claude Desktop to test each tool
```

