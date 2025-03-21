import { Chat, Store } from "./store/Store";

export interface Room {
    roomId: string;
    chats: Chat[]
}

export  class  InMemoryStore implements Store{
    private store: Map<string, Room>;
    constructor() {
       this.store = new Map<string, Room>()
    }
    initRoom() {

    }
    getChats(roomId : string, limit: number,offset: number) {
        const room = this.store.get(roomId);
        if(!room){
            return []
        }
        return

    }
    addChat(room: string, limit: number, offset: number) {

    }
    update(room: string, chatId: string){

    }
}