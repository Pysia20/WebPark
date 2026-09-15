export type Inputs = { W: boolean; A: boolean; S: boolean; D: boolean; SPACE: boolean };
export type Vector2 = { x: number; y: number };

// What the backend sends to the client
export interface ServerData {}

// What the client sends to the backend
export interface ClientData {
	inputs: Inputs[];
	pos: Vector2;
	velocity: Vector2;
}
