import { server as WebSocketServer, connection as WSConnection } from "websocket";
import { OutgoingMessage, SupportedMessage as OutgoingSupportedMessage } from './message/outgoingMessage';
import { SupportedMessage, parseIncomingMessage, IncomingMessage } from "./message/incomingMessages";
import { UserManager } from "./UserManager";
import { InMemoryStore } from "./store/InMemoryStore";
import http from 'http';

// Adjust path as necessary

const Storage = new InMemoryStore();

// ... (keep all your existing server setup code)

function messageHandler(ws: WSConnection, rawMessage: unknown) {
    try {
        const message = parseIncomingMessage(rawMessage);
        const { type, payload } = message;

        if (type === SupportedMessage.JoinRoom) {
            UserManager.addUser(payload.name, payload.userId, payload.roomId, ws);
        }

        if (type === SupportedMessage.SendMessage) {
            const user = UserManager.getUser(payload.roomId, payload.userId);
            if (!user) {
                console.error("User not found in store");
                return;
            }

            Storage.addChat(payload.userId, user.name, payload.roomId, payload.message);

            const outgoingPayload: OutgoingMessage = {
                type: OutgoingSupportedMessage.AddChat,
                payload: {
                    roomId: payload.roomId,
                    message: payload.message,
                    name: user.name,
                    upvotes: 0 // Initially, no upvotes
                }
            };

            UserManager.broadcast(payload.roomId, JSON.stringify(outgoingPayload));
        }

        if (type === SupportedMessage.UpvoteMessage) {
            const user = UserManager.getUser(payload.roomId, payload.userId);
            if (!user) {
                console.error("User not found in store");
                return;
            }

            const chat = Storage.upvote(payload.userId, payload.chatId, payload.roomId);

            if (!chat) {
                console.error("Chat not found");
                return; // Return early if chat is not found
            }

            const outgoingPayload: OutgoingMessage = {
                type: OutgoingSupportedMessage.UpdateChat,
                payload: {
                    roomId: payload.roomId,
                    chatId: payload.chatId,
                    upvotes: chat.upvotes.length // Now, count the upvotes as a number
                }
            };

            UserManager.broadcast(payload.roomId, JSON.stringify(outgoingPayload));
        }
    } catch (e) {
        console.error("Error handling message:", e);
    }
}

