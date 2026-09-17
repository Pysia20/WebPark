export type Vector2 = { x: number; y: number };

export interface PlayerInputs {
	left: boolean;
	right: boolean;
	jump: boolean;
}

// What the backend sends to the client
export interface ServerData {
	pos: Vector2;
	velocity: Vector2;
	map: Object | undefined;
}

// What the client sends to the backend
export interface ClientData {
	needsMap: boolean;
	inputs: PlayerInputs;
	id: number;
	pos: Vector2;
}
