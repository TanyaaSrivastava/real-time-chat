import { Chat, Store, UserId } from "./store/Store";

export interface Room {
    roomId: string;
    chats: Chat[]
}

export  class  InMemoryStore implements Store{
    private store: Map<string, Room>;
    constructor() {
       this.store = new Map<string, Room>()
    }
    initRoom(roomId:string) {
        this.store.set(roomId, {
            roomId,
            chats: []
        });

    }
    // last 50 chats => limit = 50, offset - 0
    // limit = 50, offset - 50 
    getChats(roomId : string, limit: number,offset: number) {
        const room = this.store.get(roomId);
        if(!room){
            return []
        }
        return room.chats.reverse().slice(0, offset).slice(-1 * limit);

    }
    addChat(userId: string, roomId: string, message: string) {
      const room = this.store.get(roomId);
       if(!room) {
        return
       }
       room.chats.push({
        userId,
        name ,
        message ,
        upvotes: []
       })
    }
    upvote(roomId: string, chatId: string){
        const room = this.store.get(roomId);
        if(!room) {
         return
        }
        room.chats.
        })
    }
}
