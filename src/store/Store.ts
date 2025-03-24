export type userId = string;

interface Chat {
    name: String;
    userId: userId;
    message: string;
    upvotes: userId;
}


export abstract class Store {
    constructor() {

    }
    initRoom() {

    }
    getChats(room : string, limit: number,offset: number) {

    }
    addChat(userId: userId, roomId: string, limit: number, offset: number) {


    }
    update(userId: userId, room: string, chatId: string){

    }
}