import { PlayerInputs, Vector2 } from "@shared/commonModels";

export class Player {
	public id: number;
	public nick: string;
	public pos: Vector2 = { x: 0, y: 0 };
	public velocity: Vector2 = { x: 0, y: 0 };
	public color: string = "";
	public roomID: string | undefined;
	public isReady: boolean = false;
	public isGrounded: boolean = false;
	public lastInputs: PlayerInputs = {
		right: false,
		left: false,
		jump: false,
	};

	constructor(id: number, nick: string) {
		this.id = id;
		this.nick = nick;
	}
}
