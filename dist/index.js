"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_1 = require("websocket");
const outgoingMessage_1 = require("./message/outgoingMessage");
const incomingMessages_1 = require("./message/incomingMessages"); // ✅ Fixed import
const UserManager_1 = require("./UserManager");
const InMemoryStore_1 = require("./store/InMemoryStore");
const http_1 = __importDefault(require("http"));
// Create HTTP server
const server = http_1.default.createServer((request, response) => {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server;
const userManager = new UserManager_1.UserManager();
const store = new InMemoryStore_1.InMemoryStore();
server.listen(8080, () => {
    console.log((new Date()) + ' Server is listening on port 8080');
});
const wsServer = new websocket_1.server({
    httpServer: server,
    autoAcceptConnections: false
});
function originIsAllowed(origin) {
    return true; // Customize origin check as needed
}
wsServer.on('request', function (request) {
    console.log("inside connect");
    if (!originIsAllowed(request.origin)) {
        //make sure we only connect request from an allowed origin
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
            }
            catch (e) {
                console.error("Failed to parse incoming message:", e);
            }
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', (reasonCode, description) => {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});
function messageHandler(ws, message) {
    const { type, payload } = message;
    if (type === incomingMessages_1.SupportedMessage.JoinRoom) {
        userManager.addUser(payload.name, payload.userId, payload.roomId, ws);
    }
    if (type === incomingMessages_1.SupportedMessage.SendMessage) {
        const user = userManager.getUser(payload.roomId, payload.userId);
        if (!user) {
            console.error("User not found in store");
            return;
        }
        store.addChat(payload.userId, user.name, payload.roomId);
        const outgoingPayload = {
            type: outgoingMessage_1.SupportedMessage.AddChat,
            payload: {
                roomId: payload.roomId,
                message: payload.message,
                name: user.name,
                upvotes: 0
            }
        };
        userManager.broadcast(payload.roomId, payload.userId, JSON.stringify(outgoingPayload));
    }
    if (type === incomingMessages_1.SupportedMessage.UpvoteMessage) {
        const user = userManager.getUser(payload.roomId, payload.userId);
        if (!user) {
            console.error("User not found in store");
            return;
        }
        const outgoingPayload = {
            type: outgoingMessage_1.SupportedMessage.UpdateChat,
            payload: {
                roomId: payload.roomId,
                message: payload.message,
                name: user.name,
                upvotes: 0 // You might want to fetch actual upvotes here
            }
        };
        userManager.broadcast(payload.roomId, payload.userId, JSON.stringify(outgoingPayload));
    }
}
