import z from "zod";

export enum SupportedMessage {
    JoinRoom = "JOIN_ROOM",
    SendMessage = "SEND_MESSAGE",
    UpvoteMessage = "UPVOTE_MESSAGE",
}

// Zod schemas for different message types
export const JoinRoomSchema = z.object({
    name: z.string(),
    userId: z.string(),
    roomId: z.string(),
});
export type JoinRoomType = z.infer<typeof JoinRoomSchema>;

export const SendMessageSchema = z.object({
    userId: z.string(),
    roomId: z.string(),
    message: z.string(),
});
export type SendMessageType = z.infer<typeof SendMessageSchema>;

export const UpvoteMessageSchema = z.object({
    userId: z.string(),
    roomId: z.string(),
    chatId: z.string(),
});
export type UpvoteMessageType = z.infer<typeof UpvoteMessageSchema>;

// Incoming message type, using union to handle different message types
export type IncomingMessage = {
    type: SupportedMessage.JoinRoom,
    payload: JoinRoomType
} | {
    type: SupportedMessage.SendMessage,
    payload: SendMessageType
} | {
    type: SupportedMessage.UpvoteMessage,
    payload: UpvoteMessageType
};

// Function to parse incoming messages with Zod validation
export function parseIncomingMessage(data: unknown): IncomingMessage {
    const parsed = z.object({
        type: z.nativeEnum(SupportedMessage),
        payload: z.unknown() // Accept any type for the payload initially
    }).parse(data);

    switch (parsed.type) {
        case SupportedMessage.JoinRoom:
            return {
                type: parsed.type,
                payload: JoinRoomSchema.parse(parsed.payload)
            };
        case SupportedMessage.SendMessage:
            return {
                type: parsed.type,
                payload: SendMessageSchema.parse(parsed.payload)
            };
        case SupportedMessage.UpvoteMessage:
            return {
                type: parsed.type,
                payload: UpvoteMessageSchema.parse(parsed.payload)
            };
        default:
            throw new Error("Invalid message type");
    }
}
