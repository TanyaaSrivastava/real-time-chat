import { Chat, Store, UserId } from "./Store";

let globalChatId = 0;

export interface Room {
    roomId: string;
    chats: Chat[];
}

export class InMemoryStore implements Store {
    private store: Map<string, Room> = new Map();

    initRoom(roomId: string) {
        if (!this.store.has(roomId)) {
            this.store.set(roomId, { roomId, chats: [] });
        }
    }

    getChats(roomId: string, limit: number, offset: number) {
        const room = this.store.get(roomId);
        if (!room) return [];
        return room.chats.slice().reverse().slice(offset, offset + limit);
    }

    addChat(userId: string, roomId: string, message: string, name: string) {
        const room = this.store.get(roomId);
        if (!room) return;

        room.chats.push({
            id: (globalChatId++).toString(),
            userId,
            name,
            message,
            upvotes: []
        });
    }

    upvote(userId: UserId, roomId: string, chatId: string) {
        const room = this.store.get(roomId);
        if (!room) return null;
        const chat = room.chats.find(c => c.id === chatId);
        if (!chat) return null;

        // Prevent multiple upvotes from the same user
        if (!chat.upvotes.includes(userId)) {
            chat.upvotes.push(userId);
        }
        
        return chat;
    }

    // Placeholder for the update method if required by Store interface
    update() {
        // Add if required by Store interface
    }
}

// Export a singleton instance
export const Storage = new InMemoryStore();
