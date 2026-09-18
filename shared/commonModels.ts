export type Vector2 = { x: number; y: number };

export interface PlayerInputs {
	userUUID: string;
	left: boolean;
	right: boolean;
	jump: boolean;
}

// What the backend sends to the client
export interface ServerData {
	playerData: ServerPlayerData[];
}

export interface ServerPlayerData {
	playerId: number;
	pos: Vector2;
	velocity: Vector2;
}

// What the client sends to the backend
export interface ClientData {
	inputs: PlayerInputs;
}
