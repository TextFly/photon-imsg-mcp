import { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { PhotonClient } from '../client.js';
import { SendMessageArgs, ReadMessagesArgs, GetConversationsArgs } from '../types.js';

/**
 * Tool definition for sending iMessages
 */
export const sendMessageToolDefinition: Tool = {
    name: "photon_send_message",
    description:
        "Sends an iMessage to a recipient. " +
        "Use this to send text messages to phone numbers or email addresses. " +
        "The recipient can be a phone number (e.g., '+1234567890') or email address.",
    inputSchema: {
        type: "object",
        properties: {
            recipient: {
                type: "string",
                description: "Recipient phone number (e.g., '+1234567890') or email address"
            },
            text: {
                type: "string",
                description: "Message text to send"
            },
            chatId: {
                type: "string",
                description: "Optional chat ID if continuing an existing conversation"
            },
        },
        required: ["recipient", "text"],
    },
};

/**
 * Tool definition for reading messages
 */
export const readMessagesToolDefinition: Tool = {
    name: "photon_read_messages",
    description:
        "Reads messages from an iMessage conversation. " +
        "Use this to retrieve message history from a specific chat or recipient. " +
        "Returns messages with timestamps and sender information.",
    inputSchema: {
        type: "object",
        properties: {
            chatId: {
                type: "string",
                description: "Chat/conversation ID (optional if recipient is provided)"
            },
            recipient: {
                type: "string",
                description: "Recipient phone number or email to filter messages by sender"
            },
            limit: {
                type: "number",
                description: "Maximum number of messages to return (default: 50)",
                default: 50
            },
            unreadOnly: {
                type: "boolean",
                description: "Only return unread messages (default: false)",
                default: false
            },
        },
    },
};

/**
 * Tool definition for getting conversations list
 */
export const getConversationsToolDefinition: Tool = {
    name: "photon_get_conversations",
    description:
        "Gets a list of all iMessage conversations. " +
        "Use this to see all active chats with their last messages and unread counts. " +
        "Returns conversation IDs that can be used with other tools.",
    inputSchema: {
        type: "object",
        properties: {
            limit: {
                type: "number",
                description: "Maximum number of conversations to return (default: 50)",
                default: 50
            },
        },
    },
};

/**
 * Tool definition for getting conversation details
 */
export const getConversationDetailsToolDefinition: Tool = {
    name: "photon_get_conversation_details",
    description:
        "Gets detailed information about a specific conversation by chat ID. " +
        "Use this to get participant information, last message, and unread count for a specific chat.",
    inputSchema: {
        type: "object",
        properties: {
            chatId: {
                type: "string",
                description: "Chat/conversation ID"
            },
        },
        required: ["chatId"],
    },
};

/**
 * Type guard for send message arguments
 */
function isSendMessageArgs(args: unknown): args is SendMessageArgs {
    return (
        typeof args === "object" &&
        args !== null &&
        "recipient" in args &&
        "text" in args &&
        typeof (args as { recipient: string }).recipient === "string" &&
        typeof (args as { text: string }).text === "string"
    );
}

/**
 * Type guard for read messages arguments
 */
function isReadMessagesArgs(args: unknown): args is ReadMessagesArgs {
    return typeof args === "object" && args !== null;
}

/**
 * Type guard for get conversations arguments
 */
function isGetConversationsArgs(args: unknown): args is GetConversationsArgs {
    return typeof args === "object" && args !== null;
}

/**
 * Handles send message tool calls
 */
export async function handleSendMessageTool(client: PhotonClient, args: unknown): Promise<CallToolResult> {
    try {
        if (!args) {
            throw new Error("No arguments provided");
        }

        if (!isSendMessageArgs(args)) {
            throw new Error("Invalid arguments for photon_send_message. Required: recipient, text");
        }

        const result = await client.sendMessage(args);
        
        return {
            content: [{ type: "text", text: result }],
            isError: false,
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
}

/**
 * Handles read messages tool calls
 */
export async function handleReadMessagesTool(client: PhotonClient, args: unknown): Promise<CallToolResult> {
    try {
        if (!args) {
            throw new Error("No arguments provided");
        }

        if (!isReadMessagesArgs(args)) {
            throw new Error("Invalid arguments for photon_read_messages");
        }

        const result = await client.readMessages(args);
        
        return {
            content: [{ type: "text", text: result }],
            isError: false,
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
}

/**
 * Handles get conversations tool calls
 */
export async function handleGetConversationsTool(client: PhotonClient, args: unknown): Promise<CallToolResult> {
    try {
        if (!args) {
            throw new Error("No arguments provided");
        }

        if (!isGetConversationsArgs(args)) {
            throw new Error("Invalid arguments for photon_get_conversations");
        }

        const result = await client.getConversations(args);
        
        return {
            content: [{ type: "text", text: result }],
            isError: false,
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
}

/**
 * Handles get conversation details tool calls
 */
export async function handleGetConversationDetailsTool(client: PhotonClient, args: unknown): Promise<CallToolResult> {
    try {
        if (!args || typeof args !== "object" || !("chatId" in args)) {
            throw new Error("chatId is required");
        }

        const chatId = (args as { chatId: string }).chatId;
        if (typeof chatId !== "string") {
            throw new Error("chatId must be a string");
        }

        const result = await client.getConversationDetails(chatId);
        
        return {
            content: [{ type: "text", text: result }],
            isError: false,
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
}

