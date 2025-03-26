export type userId = string;

interface Chat {
    name: String;
    userId: userId;
    message: string;
    upvotes: userId;
}
interface Room {
    chats: Chat[];
}


export abstract class Store {

    constructor() {
        this.store = new Map<string> , Room>();
    }
    initRoom(roomId: string) {

    }
    getChats(roomId : string, limit: number,offset: number) {
        const room = this.store.get(roomId);

    }
    addChat(userId: userId, roomId: string,message: string ) {


    }
    update(userId: userId, room: string, chatId: string){

    }
}