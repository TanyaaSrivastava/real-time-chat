export enum SupportedMessage{
    AddChat = "ADD_CHAT",
    UpdateChat = "UpdateChat",
}
export type AddChatPayload = {
    roomId: string;
    message: string;
    name: string;
    upvotes: number;
  };
  
  export type UpdateChatPayload = {
    roomId: string;
    message: string;
    name: string;
    upvotes: number;
  };
type MessagePayload = {
    roomId: string;
    message: string;
    name: string;
    upvotes: number;

    }
export type OutgoingMessage = {
        type: SupportedMessage.AddChat,
        payload: MessagePayload
    
} | {
    type: SupportedMessage.UpdateChat,
    payload: Partial<MessagePayload>

}