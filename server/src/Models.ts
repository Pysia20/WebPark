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

/**
 * **A** is the colliding object.
 *
 * **B** is a static object.
 *
 * Collision type is which side of **B** is **A** touching.
 * When collision type is "Right" it means that:
 *- **A** needs to be moved to the right
 *- **LEFT** side of **A** is touching the **RIGHT** side of **B**
 *
 * **Perfect** is a situation in which **A** lands perfectly on **B**'s corner
 */
export type CollisionType = "Right" | "Left" | "Top" | "Bottom" | "Perfect" | undefined;
