type userId = string;

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
    addChat(room: string, limit: number, offset: number) {

    }
    update(room: string, chatId: string){

    }
}