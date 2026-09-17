export type Inputs = { W: boolean; A: boolean; S: boolean; D: boolean; SPACE: boolean };
export type Vector2 = { x: number; y: number };

// What the backend sends to the client
export interface ServerData {
	pos: Vector2;
	velocity: Vector2;
	map: Object | undefined;
}

// What the client sends to the backend
export interface ClientData {
	inputs: Inputs[];
	needsMap: boolean;
}
