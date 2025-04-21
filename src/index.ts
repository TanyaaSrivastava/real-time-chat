import { server as WebSocketServer, connection as WSConnection } from "websocket";
import { OutgoingMessage, SupportedMessage as OutgoingSupportedMessage } from './message/outgoingMessage';
import { initMessage, SupportedMessage, incomingMessage } from "./message/incomingMessages"; 
import { UserManager } from "./UserManager";
import { InMemoryStore } from "./store/InMemoryStore";
import http from 'http';

// Create HTTP server
const server = http.createServer((request, response) => {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

const userManager = new UserManager();
const store = new InMemoryStore();

server.listen(8080, () => {
    console.log((new Date()) + ' Server is listening on port 8080');
});

const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

function originIsAllowed(origin: string): boolean {
    // Customize origin check as needed
    return true;
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

    connection.on('close', (reasonCode, description) => {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

function messageHandler(ws: WSConnection, message: IncomingMessage) {
    const { type, payload } = message;

    if (type === SupportedMessage.JoinRoom) {
        userManager.addUser(payload.name, payload.userId, payload.roomId, ws);
    }

    if (type === SupportedMessage.SendMessage) {
        const user = userManager.getUser(payload.roomId, payload.userId);
        if (!user) {
            console.error("User not found in store");
            return;
        }

        store.addChat(payload.userId, user.name, payload.roomId);

        const outgoingPayload: OutgoingMessage = {
            type: OutgoingSupportedMessage.AddChat,
            payload: {
                roomId: payload.roomId,
                message: payload.message,
                name: user.name,
                upvotes: 0
            }
        };

        userManager.broadcast(payload.roomId, payload.userId, outgoingPayload);
    }

    if (type === SupportedMessage.UpvoteMessage) {
        const user = userManager.getUser(payload.roomId, payload.userId);
        if (!user) {
            console.error("User not found in store");
            return;
        }

        store.upvote(payload.userId, payload.chatId, payload.roomId);

        const outgoingPayload: OutgoingMessage = {
            type: OutgoingSupportedMessage.UpdateChat,
            payload: {
                roomId: payload.roomId,
                message: payload.message,
                name: user.name,
                upvotes: 0 
            }
        };

        userManager.broadcast(payload.roomId, payload.userId, outgoingPayload);
    }
}
