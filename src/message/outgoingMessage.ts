export enum SupportedMessage {
    AddChat = "ADD_CHAT",
    UpdateChat = "UPDATE_CHAT"
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
    message?: string;
    name?: string;
    upvotes?: number;
    chatId?: string;
};
export type OutgoingMessage = {
    type: SupportedMessage;
    payload: MessagePayload;
} | {
    type: SupportedMessage.UpdateChat,
    payload: Partial<MessagePayload>

}