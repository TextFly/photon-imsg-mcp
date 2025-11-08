/**
 * Type definitions for Photon iMessage MCP integration
 */

/**
 * Message data structure
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
    recipient: string;
    text: string;
    chatId?: string;
}

/**
 * Read messages arguments
 * @interface ReadMessagesArgs
 */
export interface ReadMessagesArgs {
    recipient?: string;
    limit?: number;
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

