import { server as WebSocketServer, connection as WSConnection } from "websocket";
import { OutgoingMessage, SupportedMessage as OutgoingSupportedMessage } from './message/outgoingMessage';
import { initMessage, SupportedMessage, IncomingMessage } from './message/incomingMessages'; // ✅ Fixed import
import { UserManager } from "./UserManager";
import { InMemoryStore } from "./store/InMemoryStore";
import http from 'http';

// Adjust path as necessary

const Storage = new InMemoryStore();

const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: true
});

function originIsAllowed(origin: string): boolean {
    return true; // Customize origin check as needed
}

wsServer.on('request', (request) => {
    if (!originIsAllowed(request.origin)) {
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }

    const connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');

    connection.on('message', (message) => {
        if (message.type === 'utf8') {
            try {
                const parsed = JSON.parse(message.utf8Data);
                messageHandler(connection, parsed);
            } catch (e) {
                console.error("Failed to parse incoming message:", e);
            }
        } else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
});

function messageHandler(ws: WSConnection, rawMessage: unknown) {
    try {
        const message = initMessage(rawMessage);  // Assuming parseIncomingMessage is renamed to initMessage
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
