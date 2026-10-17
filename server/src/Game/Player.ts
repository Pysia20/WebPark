import { PlayerInputs, Vector2 } from "@shared/commonModels";
import { CollisionOutput, Entity } from "./Entity";
import { PLAYER_CONFIG } from "@shared/commonVariables";
import { DummyEntityCustomFields } from "@shared/commonLevelModels";
import { LOG } from "../Logger";

export class Player extends Entity {
	public id: number;
	public nick: string;
	public pos: Vector2 = { x: 0, y: 0 };
	public color: string = "";
	public roomID: string | undefined;
	public isReady: boolean = false;
	public isInsideDoor: boolean = false;

	public lastInputs: PlayerInputs = {
		right: false,
		left: false,
		jump: false,
	};

	constructor(id: number, nick: string) {
		super(
			{ x: 0, y: 0 },
			{ x: PLAYER_CONFIG.WIDTH, y: PLAYER_CONFIG.HEIGHT },
			DummyEntityCustomFields,
			"Player",
		);
		((this.id = id), (this.nick = nick));
	}

	protected override onRightCollision(
		output: CollisionOutput,
		overlap: Vector2,
		other: Entity,
	): void {}

	protected override onLeftCollision(
		output: CollisionOutput,
		overlap: Vector2,
		other: Entity,
	): void {}

	protected override onDownCollision(
		output: CollisionOutput,
		overlap: Vector2,
		other: Entity,
	): void {}

	protected override onUpCollision(
		output: CollisionOutput,
		overlap: Vector2,
		other: Entity,
	): void {}

	public clone() {
		LOG.warn("You shouldn't use .clone() on a Player. It only returns a reference");
		return this;
	}
}
