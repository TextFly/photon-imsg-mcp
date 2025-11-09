import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

/**
 * Runs the MCP server using STDIO transport
 * Used for local development and debugging
 * @param {Server} server - MCP server instance to connect
 * @returns {Promise<void>}
 */
export async function runStdioTransport(server: Server): Promise<void> {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    // Note: Using console.error for stderr (MCP protocol uses stdout for JSON-RPC)
    // This message won't interfere with MCP communication
    console.error('Photon iMessage MCP server running on stdio');
}

