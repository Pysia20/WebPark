import { PlayerInputs, Vector2 } from "@shared/commonModels";
import { CollisionOutput, Entity } from "./Entity";
import { PLAYER_CONFIG } from "@shared/commonVariables";
import { DummyEntityCustomFields } from "@shared/commonLevelModels";
import { LOG } from "../Logger";
import { clamp } from "../Global";
import { Level } from "./Level";

import CONFIG from "../../config.json";

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

		this.isDynamic = true;
	}

	protected override onRightCollision(overlap: Vector2, other: Entity) {}

	protected override onLeftCollision(overlap: Vector2, other: Entity) {}

	protected override onUpCollision(overlap: Vector2, other: Entity) {}

	protected override onDownCollision(overlap: Vector2, other: Entity) {}

	public override handleBehaviour(l: Level) {
		if (this.velocity.x > PLAYER_CONFIG.DRAG) {
			this.velocity.x -= PLAYER_CONFIG.DRAG;
		} else if (this.velocity.x < -PLAYER_CONFIG.DRAG) {
			this.velocity.x += PLAYER_CONFIG.DRAG;
		} else {
			this.velocity.x = 0;
		}

		if (!this.isGrounded) {
			this.velocity.y += PLAYER_CONFIG.GRAVITY;
		}

		if (!this.isInsideDoor) {
			if (this.lastInputs.right) {
				this.velocity.x += PLAYER_CONFIG.ACCELERATION;
			}
			if (this.lastInputs.left) {
				this.velocity.x -= PLAYER_CONFIG.ACCELERATION;
			}
			if (this.lastInputs.jump && this.isGrounded) {
				this.velocity.y -= PLAYER_CONFIG.JUMP_FORCE;
				this.isGrounded = false;
			}
		}

		this.velocity.y = clamp(
			this.velocity.y,
			-PLAYER_CONFIG.MAX_VERTICAL_SPEED,
			PLAYER_CONFIG.MAX_VERTICAL_SPEED,
		);

		this.velocity.x = clamp(
			this.velocity.x,
			-PLAYER_CONFIG.MAX_HORIZONTAL_SPEED,
			PLAYER_CONFIG.MAX_HORIZONTAL_SPEED,
		);

		this.pos.x += this.velocity.x * (1 / CONFIG.TICKRATE);
		this.pos.y += this.velocity.y * (1 / CONFIG.TICKRATE);
	}

	public clone() {
		LOG.warn("You shouldn't use .clone() on a Player. It only returns a reference");
		return this;
	}
}
