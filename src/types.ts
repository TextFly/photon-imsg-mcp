/**
 * Type definitions for Photon iMessage MCP integration
 *
 * Note: These types are for MCP tool arguments and responses.
 * They are separate from the SDK's internal types (e.g., SDK's Message type).
 */

/**
 * Message data structure for MCP responses
 * Note: This is a simplified version for MCP tool responses.
 * The SDK's internal Message type is more comprehensive.
 * @interface Message
 */
export interface Message {
    id?: string;
    text: string;
    handle?: string;
    date?: Date | string;
    isFromMe?: boolean;
    chatId?: string;
}

/**
 * Conversation/chat data structure
 * @interface Conversation
 */
export interface Conversation {
    id: string;
    displayName?: string;
    participants?: string[];
    lastMessage?: string;
    lastMessageDate?: Date | string;
    unreadCount?: number;
}

/**
 * Send message arguments
 * @interface SendMessageArgs
 */
export interface SendMessageArgs {
    /**
     * Recipient phone number or email address
     * Phone format: +1234567890, (123) 456-7890
     * Email format: user@example.com
     * This will be validated using the SDK's asRecipient function
     */
    recipient: string;
    /** Message text content to send */
    text: string;
    /** Optional chat ID for group messages */
    chatId?: string;
}

/**
 * Read messages arguments
 * @interface ReadMessagesArgs
 */
export interface ReadMessagesArgs {
    /**
     * Optional recipient to filter messages by (phone number or email)
     * If provided, will be validated using the SDK's asRecipient function
     */
    recipient?: string;
    /** Maximum number of messages to return (default: 50) */
    limit?: number;
    /** Only return unread messages (default: false) */
    unreadOnly?: boolean;
}

/**
 * Get conversations arguments
 * @interface GetConversationsArgs
 */
export interface GetConversationsArgs {
    limit?: number;
    offset?: number;
}

