export type Vector2 = { x: number; y: number };

export interface PlayerInputs {
	left: boolean;
	right: boolean;
	jump: boolean;
}

// What the backend sends to the client
export interface ServerData {

}

// What the client sends to the backend
export interface ClientData {
	inputs: PlayerInputs;
	id: number;
	pos: Vector2;

//	velocity: Vector2; unneeded?
}
