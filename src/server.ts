import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { PhotonClient } from './client.js';
import {
    sendMessageToolDefinition,
    readMessagesToolDefinition,
    getConversationsToolDefinition,
    getConversationDetailsToolDefinition,
    handleSendMessageTool,
    handleReadMessagesTool,
    handleGetConversationsTool,
    handleGetConversationDetailsTool
} from './tools/index.js';

/**
 * Main server class for Photon iMessage MCP integration
 * @class PhotonServer
 */
export class PhotonServer {
    private client: PhotonClient;
    private server: Server;

    /**
     * Creates a new PhotonServer instance
     */
    constructor() {
        this.client = new PhotonClient();
        this.server = new Server(
            {
                name: 'photon-imsg-mcp',
                version: '0.1.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.setupHandlers();
        this.setupErrorHandling();
    }

    /**
     * Sets up MCP request handlers for tools
     * @private
     */
    private setupHandlers(): void {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                sendMessageToolDefinition,
                readMessagesToolDefinition,
                getConversationsToolDefinition,
                getConversationDetailsToolDefinition,
            ],
        }));

        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            switch (name) {
                case 'photon_send_message':
                    return handleSendMessageTool(this.client, args);
                
                case 'photon_read_messages':
                    return handleReadMessagesTool(this.client, args);
                
                case 'photon_get_conversations':
                    return handleGetConversationsTool(this.client, args);
                
                case 'photon_get_conversation_details':
                    return handleGetConversationDetailsTool(this.client, args);
                
                default:
                    throw new McpError(
                        ErrorCode.MethodNotFound,
                        `Unknown tool: ${name}`
                    );
            }
        });
    }

    /**
     * Configures error handling and graceful shutdown
     * @private
     */
    private setupErrorHandling(): void {
        this.server.onerror = (error) => console.error('[MCP Error]', error);
        
        const cleanup = async () => {
            try {
                await this.client.close();
                await this.server.close();
            } catch (error) {
                console.error('Error during cleanup:', error);
            }
            process.exit(0);
        };

        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);
    }

    /**
     * Returns the underlying MCP server instance
     * @returns {Server} MCP server instance
     */
    getServer(): Server {
        return this.server;
    }
}

/**
 * Factory function for creating standalone server instances
 * Used by HTTP transport for session-based connections
 * @returns {Server} Configured MCP server instance
 */
export function createStandaloneServer(): Server {
    const server = new Server(
        {
            name: "photon-imsg-mcp",
            version: "0.1.0",
        },
        {
            capabilities: {
                tools: {},
            },
        },
    );

    const client = new PhotonClient();

    // Cleanup on server close
    server.onclose = async () => {
        try {
            await client.close();
        } catch (error) {
            console.error('Error closing client:', error);
        }
    };

    // Set up handlers
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: [
            sendMessageToolDefinition,
            readMessagesToolDefinition,
            getConversationsToolDefinition,
            getConversationDetailsToolDefinition,
        ],
    }));

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;

        switch (name) {
            case 'photon_send_message':
                return handleSendMessageTool(client, args);
            
            case 'photon_read_messages':
                return handleReadMessagesTool(client, args);
            
            case 'photon_get_conversations':
                return handleGetConversationsTool(client, args);
            
            case 'photon_get_conversation_details':
                return handleGetConversationDetailsTool(client, args);
            
            default:
                throw new McpError(
                    ErrorCode.MethodNotFound,
                    `Unknown tool: ${name}`
                );
        }
    });

    return server;
}

