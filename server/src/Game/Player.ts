import { Vector2 } from "../../../shared/commonModels";

export class Player {
	private id: string;
	private nick: string;
	private pos: Vector2 = { x: 0, y: 0 };
	private velocity: Vector2 = { x: 0, y: 0 };
	private color: string = "";
	private roomID: string | undefined;

	constructor(id: string, nick: string) {
		this.id = id;
		this.nick = nick;
	}

	public getID(): string {
		return this.id;
	}
}
