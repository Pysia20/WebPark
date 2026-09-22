import z from "zod";

export type Vector2 = { x: number; y: number };

export interface PlayerInputs {
	left: boolean;
	right: boolean;
	jump: boolean;
}

// What the backend sends to the client
export interface ServerData {
	playerData: Record<string, ServerPlayerData>;
}

export interface ServerPlayerData {
	nick: string;
	pos: Vector2;
	velocity: Vector2;
}

// What the client sends to the backend
export interface ClientData {
	inputs: PlayerInputs;
}

// Server -> Client when player joins a room (Server sends an array of that)
export interface PlayerJoinedData {
	playerUUID: number;
	nick: string;
	color: string;
}

//###############################################################
// DEJMI TEGO NIE MUSISZ IMPORTOWAC NIGDZIE IMPORTUJ TO NIZEJ
//###############################################################
export const RegisterUserDataZod = z
	.object({
		roomID: z.string().length(6),
		userID: z.number(),
		userNick: z.string(),
		color: z.string().length(7),
	})
	.strict();

export type RegisterUserData = z.infer<typeof RegisterUserDataZod>;
