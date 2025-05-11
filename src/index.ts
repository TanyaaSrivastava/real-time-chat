import http from "http";
import { server as WebSocketServer, connection as WSConnection } from "websocket";
import { OutgoingMessage, SupportedMessage as OutgoingSupportedMessage } from './message/outgoingMessage';
import { parseIncomingMessage, SupportedMessage } from './message/incomingMessages';
import { UserManager } from "./UserManager";
import { InMemoryStore } from "./store/InMemoryStore";

// Create a shared in-memory storage
const Storage = new InMemoryStore();

// ✅ 1. Create HTTP server
const server = http.createServer((req, res) => {
    res.writeHead(404);
    res.end();
});

// ✅ 2. Create WebSocket server with the HTTP server
const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: true
});

// ✅ 3. Listen on a port
server.listen(8080, () => {
    console.log("HTTP and WebSocket server running on port 8080");
});

// ✅ 4. WebSocket logic
wsServer.on('request', (request) => {
<<<<<<< HEAD
=======
    console.log("inside connect");
    if (!originIsAllowed(request.origin)) {
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }

>>>>>>> 7997804 (WIP: saving changes before pull)
    const connection = request.accept('echo-protocol', request.origin);
    console.log(`[${new Date().toISOString()}] Connection accepted from ${request.origin}`);

    connection.on('message', (message) => {
        console.log(message);
        if (message.type === 'utf8') {
            try {
                console.log("indie with message"+ message.utf8Data)
                const parsed = JSON.parse(message.utf8Data);
                messageHandler(connection, parsed);
            } catch (e) {
                console.error("❌ Failed to parse incoming message:", e);
            }
        } else if (message.type === 'binary') {
            console.log('📦 Received Binary Message of', message.binaryData.length, 'bytes');
            connection.sendBytes(message.binaryData);
        }
    });

    connection.on('close', () => {
        console.log(`[${new Date().toISOString()}] Connection closed.`);
        // Optionally: clean up user from UserManager here
    });
});

<<<<<<< HEAD
function messageHandler(ws: WSConnection, rawMessage: unknown) {
    try {
        const message = parseIncomingMessage(rawMessage);
        const { type, payload } = message;
=======
function messageHandler(ws: WSConnection, message: IncomingMessage) {
    console.log("incoming message"+ JSON.stringify(message));
    const { type, payload } = message;
>>>>>>> 7997804 (WIP: saving changes before pull)

        if (type === SupportedMessage.JoinRoom) {
            UserManager.addUser(payload.name, payload.userId, payload.roomId, ws);
        }

        if (type === SupportedMessage.SendMessage) {
            const user = UserManager.getUser(payload.roomId, payload.userId);
            if (!user) {
                console.error("User not found in store");
                return;
            }

            Storage.addChat(payload.userId, payload.roomId, payload.message, user.name);

            const outgoingPayload: OutgoingMessage = {
                type: OutgoingSupportedMessage.AddChat,
                payload: {
                    roomId: payload.roomId,
                    message: payload.message,
                    name: user.name,
                    upvotes: 0
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
                return;
            }

            const outgoingPayload: OutgoingMessage = {
                type: OutgoingSupportedMessage.UpdateChat,
                payload: {
                    roomId: payload.roomId,
                    chatId: payload.chatId,
                    upvotes: chat.upvotes.length
                }
            };

            UserManager.broadcast(payload.roomId, JSON.stringify(outgoingPayload));
        }
    } catch (e) {
        console.error("❌ Error handling message:", e);
    }
}
