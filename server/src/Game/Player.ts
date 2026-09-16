import { Vector2 } from "../../../shared/commonModels";

class Player {
	private id: string;
	private pos: Vector2 = { x: 0, y: 0 };
	private velocity: Vector2 = { x: 0, y: 0 };
	private color: string = "";
	private roomID: string | undefined;

	constructor(id: string) {
		this.id = id;
	}
}
