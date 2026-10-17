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
	}

	protected override onRightCollision(
		overlap: Vector2,
		other: Entity,
	): CollisionOutput | undefined {
		return undefined;
	}

	protected override onLeftCollision(
		overlap: Vector2,
		other: Entity,
	): CollisionOutput | undefined {
		return undefined;
	}

	protected override onDownCollision(
		overlap: Vector2,
		other: Entity,
	): CollisionOutput | undefined {
		return undefined;
	}

	protected override onUpCollision(overlap: Vector2, other: Entity): CollisionOutput | undefined {
		return undefined;
	}

	public override handleBehaviour(l: Level) {
		if (this.newVelocity.x > PLAYER_CONFIG.DRAG) {
			this.newVelocity.x -= PLAYER_CONFIG.DRAG;
		} else if (this.newVelocity.x < -PLAYER_CONFIG.DRAG) {
			this.newVelocity.x += PLAYER_CONFIG.DRAG;
		} else {
			this.newVelocity.x = 0;
		}

		if (!this.isGrounded) {
			this.newVelocity.y += PLAYER_CONFIG.GRAVITY;
		}

		if (!this.isInsideDoor) {
			if (this.lastInputs.right) {
				this.newVelocity.x += PLAYER_CONFIG.ACCELERATION;
			}
			if (this.lastInputs.left) {
				this.newVelocity.x -= PLAYER_CONFIG.ACCELERATION;
			}
			if (this.lastInputs.jump && this.isGrounded) {
				this.newVelocity.y -= PLAYER_CONFIG.JUMP_FORCE;
				this.isGrounded = false;
			}
		}

		this.newVelocity.y = clamp(
			this.newVelocity.y,
			-PLAYER_CONFIG.MAX_VERTICAL_SPEED,
			PLAYER_CONFIG.MAX_VERTICAL_SPEED,
		);

		this.newVelocity.x = clamp(
			this.newVelocity.x,
			-PLAYER_CONFIG.MAX_HORIZONTAL_SPEED,
			PLAYER_CONFIG.MAX_HORIZONTAL_SPEED,
		);

		this.newPos.x += this.newVelocity.x * (1 / CONFIG.TICKRATE);
		this.newPos.y += this.newVelocity.y * (1 / CONFIG.TICKRATE);

		this.swapPosition();
	}

	public clone() {
		LOG.warn("You shouldn't use .clone() on a Player. It only returns a reference");
		return this;
	}
}
