import { connection as WSConnection } from "websocket";

interface User {
    id: string;
    name: string;
    conn: WSConnection;
}

interface Room {
    users: User[];
}

class _UserManager {
    private rooms: Map<string, Room> = new Map();

    addUser(name: string, userId: string, roomId: string, socket: WSConnection) {
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, { users: [] });
        }
        this.rooms.get(roomId)!.users.push({ id: userId, name, conn: socket });
    }

    removeUser(roomId: string, userId: string) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        // Filter out the user from the room's user list
        room.users = room.users.filter(({ id }) => id !== userId);
    }

    getUser(roomId: string, userId: string) {
        const room = this.rooms.get(roomId);
        if (!room) return null;
        return room.users.find(user => user.id === userId) || null;
    }

    broadcast(roomId: string, message: string) {
        const room = this.rooms.get(roomId);
        if (!room) return;
        room.users.forEach(({ conn }) => {
            conn.sendUTF(message);
        });
    }
}

// Export a singleton instance
export const UserManager = new _UserManager();
