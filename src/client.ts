import { Message, Conversation, SendMessageArgs, ReadMessagesArgs, GetConversationsArgs } from './types.js';
import { IMessageSDK, asRecipient, type Recipient } from '@photon-ai/imessage-kit';

/**
 * Client for interacting with the Photon iMessage SDK
 * @class PhotonClient
 */
export class PhotonClient {
    private sdk: IMessageSDK;

    /**
     * Creates a new PhotonClient instance
     * Initializes the Photon iMessage SDK
     */
    constructor() {
        try {
            // Suppress SDK console output in STDIO mode to avoid interfering with MCP protocol
            const originalConsoleLog = console.log;
            const originalConsoleInfo = console.info;
            
            // Temporarily suppress console output during SDK initialization
            console.log = () => {};
            console.info = () => {};
            
            // Initialize Photon SDK with optional configuration
            this.sdk = new IMessageSDK({
                debug: false, // Disable SDK debug output in STDIO mode
                maxConcurrent: 5
            });
            
            // Restore console output
            console.log = originalConsoleLog;
            console.info = originalConsoleInfo;
        } catch (error) {
            throw new Error(`Failed to initialize Photon SDK: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Closes the SDK and releases resources
     * Should be called when done using the client
     */
    async close(): Promise<void> {
        await this.sdk.close();
    }

    /**
     * Sends an iMessage
     * @param {SendMessageArgs} args - Message arguments
     * @returns {Promise<string>} Success message
     */
    async sendMessage(args: SendMessageArgs): Promise<string> {
        try {
            const { recipient, text } = args;

            if (!recipient || !text) {
                throw new Error('Recipient and text are required');
            }

            // Validate recipient format (phone number or email)
            let validatedRecipient: Recipient;
            try {
                validatedRecipient = asRecipient(recipient);
            } catch (error) {
                throw new Error(`Invalid recipient format: ${recipient}. Expected phone number (e.g., +1234567890) or email address.`);
            }

            // Use Photon SDK unified send API
            await this.sdk.send(validatedRecipient, text);

            return `Message sent successfully to ${recipient}`;
        } catch (error) {
            throw new Error(`Failed to send message: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Reads messages from a conversation
     * @param {ReadMessagesArgs} args - Read arguments
     * @returns {Promise<string>} Formatted message list
     */
    async readMessages(args: ReadMessagesArgs): Promise<string> {
        try {
            const { recipient, limit = 50, unreadOnly } = args;

            // Build filter object for Photon SDK
            const filter: any = {
                excludeOwnMessages: false, // Include all messages
            };

            if (recipient) {
                // Validate recipient format if provided
                try {
                    const validatedRecipient = asRecipient(recipient);
                    filter.sender = validatedRecipient;
                } catch (error) {
                    throw new Error(`Invalid recipient format: ${recipient}. Expected phone number (e.g., +1234567890) or email address.`);
                }
            }

            if (unreadOnly) {
                filter.unreadOnly = true;
            }

            if (limit) {
                filter.limit = limit;
            }

            // Get messages using Photon SDK
            const result = await this.sdk.getMessages(filter);
            
            // Handle MessageQueryResult - it might be an array or have a messages property
            const messages = Array.isArray(result) ? result : (result as any).messages || [];

            if (!messages || messages.length === 0) {
                return 'No messages found';
            }

            return messages.map((msg: any) => {
                const date = msg.date ? new Date(msg.date).toLocaleString() : 'Unknown date';
                const sender = msg.isFromMe ? 'You' : (msg.sender || 'Unknown');
                const text = msg.text || '(no text)';
                const service = msg.service || 'iMessage';
                return `[${date}] ${sender} (${service}): ${text}`;
            }).join('\n\n');
        } catch (error) {
            throw new Error(`Failed to read messages: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Gets list of conversations by extracting unique chat IDs from messages
     * @param {GetConversationsArgs} args - Get conversations arguments
     * @returns {Promise<string>} Formatted conversation list
     */
    async getConversations(args: GetConversationsArgs): Promise<string> {
        try {
            const { limit = 50 } = args;

            // Get recent messages to extract conversations
            const result = await this.sdk.getMessages({
                limit: limit * 10, // Get more messages to find unique conversations
                excludeOwnMessages: false
            });
            
            // Handle MessageQueryResult - it might be an array or have a messages property
            const messages = Array.isArray(result) ? result : (result as any).messages || [];

            if (!messages || messages.length === 0) {
                return 'No conversations found';
            }

            // Group messages by chatId
            const conversationMap = new Map<string, {
                chatId: string;
                lastMessage: string;
                lastDate: Date;
                participants: Set<string>;
                unreadCount: number;
            }>();

            for (const msg of messages) {
                const chatId = msg.chatId;
                if (!conversationMap.has(chatId)) {
                    conversationMap.set(chatId, {
                        chatId,
                        lastMessage: msg.text || '(no text)',
                        lastDate: msg.date,
                        participants: new Set(),
                        unreadCount: 0
                    });
                }

                const conv = conversationMap.get(chatId)!;
                if (msg.date > conv.lastDate) {
                    conv.lastMessage = msg.text || '(no text)';
                    conv.lastDate = msg.date;
                }
                if (!msg.isFromMe) {
                    conv.participants.add(msg.sender);
                    if (!msg.isRead) {
                        conv.unreadCount++;
                    }
                }
            }

            // Convert to array and sort by last message date
            const conversations = Array.from(conversationMap.values())
                .sort((a, b) => b.lastDate.getTime() - a.lastDate.getTime())
                .slice(0, limit);

            return conversations.map((conv) => {
                const participants = Array.from(conv.participants).join(', ') || 'Unknown';
                const unread = conv.unreadCount > 0 ? ` (${conv.unreadCount} unread)` : '';
                return `Chat ID: ${conv.chatId}\nParticipants: ${participants}\nLast Message: ${conv.lastMessage}${unread}`;
            }).join('\n\n---\n\n');
        } catch (error) {
            throw new Error(`Failed to get conversations: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Gets conversation details by ID
     * @param {string} chatId - Chat/conversation ID
     * @returns {Promise<string>} Formatted conversation details
     */
    async getConversationDetails(chatId: string): Promise<string> {
        try {
            if (!chatId) {
                throw new Error('Chat ID is required');
            }

            // Get messages for this specific chat
            const result = await this.sdk.getMessages({
                limit: 100,
                excludeOwnMessages: false
            });
            
            // Handle MessageQueryResult - it might be an array or have a messages property
            const allMessages = Array.isArray(result) ? result : (result as any).messages || [];

            // Filter messages by chatId
            const chatMessages = allMessages.filter((msg: any) => msg.chatId === chatId);

            if (chatMessages.length === 0) {
                return `No messages found for chat ID: ${chatId}`;
            }

            // Extract conversation details from messages
            const participants = new Set<string>();
            let lastMessage = 'No messages';
            let lastDate: Date | null = null;
            let unreadCount = 0;
            let isGroupChat = false;

            for (const msg of chatMessages) {
                if (!msg.isFromMe) {
                    participants.add(msg.sender);
                    if (!msg.isRead) {
                        unreadCount++;
                    }
                }
                if (!lastDate || msg.date > lastDate) {
                    lastMessage = msg.text || '(no text)';
                    lastDate = msg.date;
                }
                if (msg.isGroupChat) {
                    isGroupChat = true;
                }
            }

            const participantsList = Array.from(participants).join(', ') || 'Unknown';
            const lastDateStr = lastDate ? new Date(lastDate).toLocaleString() : 'Unknown';

            return `Chat ID: ${chatId}\n` +
                   `Type: ${isGroupChat ? 'Group Chat' : '1-on-1'}\n` +
                   `Participants: ${participantsList}\n` +
                   `Last Message: ${lastMessage}\n` +
                   `Last Message Date: ${lastDateStr}\n` +
                   `Unread Count: ${unreadCount}\n` +
                   `Total Messages: ${chatMessages.length}`;
        } catch (error) {
            throw new Error(`Failed to get conversation details: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}

