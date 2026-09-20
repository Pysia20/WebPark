import { z } from "zod";

export const RegisterUserDataZod = z
	.object({
		roomID: z.string().length(6),
		userUUID: z.uuid(),
		userNick: z.string(),
	})
	.strict();

export type RegisterUserData = z.infer<typeof RegisterUserDataZod>;

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
