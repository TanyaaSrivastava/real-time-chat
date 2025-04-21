export type UserId = string;

export interface Chat {
    id: string;
    name: string;
    userId: UserId;
    message: string;
    upvotes: UserId[];
}

export abstract class Store {
    constructor() {
        // this.store = new Map<string, Room>();
    }

    initRoom(roomId: string) {}

    getChats(roomId: string, limit: number, offset: number) {}

    // 🔥 Fix here: add name to match the implementation
    abstract addChat(userId: UserId, roomId: string, message: string, name: string): void;

    abstract update(userId: UserId, room: string, chatId: string): void;
}
