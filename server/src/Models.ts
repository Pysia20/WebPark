import { string, z } from "zod";

export const JoinRoomRequestZod = z
	.object({
		roomID: z.string().length(6),
	})
	.strict();

export type JoinRoomRequest = z.infer<typeof JoinRoomRequestZod>;

export const InputsZod = z
	.object({
		left: z.boolean(),
		right: z.boolean(),
		jump: z.boolean(),
	})
	.strict();

export const SocketDataZod = z
	.object({
		roomID: z.string().length(6).optional(),
		userNick: z.string().optional(),
		userID: z.number().optional(),
	})
	.strict();

export type SocketData = z.infer<typeof SocketDataZod>;
