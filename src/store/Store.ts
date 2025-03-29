export type UserId = string;

 export interface Chat {
    id : string;
    name: string;
    userId:UserId;
    message: string;
    upvotes: UserId[];
}



export abstract class Store {

    constructor() {
       // this.store = new Map<string> , Room>();
    }
    initRoom(roomId: string) {

    }
    getChats(roomId : string, limit: number,offset: number) {
        //const room = this.store.get(roomId);

    }
    addChat(userId: UserId, roomId: string,message: string ) {


    }
    update(userId: UserId, room: string, chatId: string){

    }
}