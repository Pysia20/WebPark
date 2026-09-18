import { Vector2 } from "../../../shared/commonModels";

export class Player {
	private id: string;
	private nick: string;
	private pos: Vector2 = { x: 0, y: 0 };
	private velocity: Vector2 = { x: 0, y: 0 };
	private color: string = "";
	private roomID: string | undefined;
	private isReady: boolean = false;

	constructor(id: string, nick: string) {
		this.id = id;
		this.nick = nick;
	}

	public getID(): string {
		return this.id;
	}

	public getNick(): string {
		return this.nick;
	}

	public getIsReady(): boolean {
		return this.isReady;
	}

	public setIsReady(v: boolean) {
		this.isReady = v;
	}

	public getPos(): Vector2 {
		return this.pos;
	}

	public getVelocity(): Vector2 {
		return this.velocity;
	}

	public setPos(v: Vector2) {
		this.pos = v;
	}

	public setVelocity(v: Vector2) {
		this.velocity = v;
	}
}
