import { PlayerInputs, Vector2 } from "@shared/commonModels";
import { Entity } from "./Entity";
import { PLAYER_CONFIG } from "@shared/commonVariables";
import { DummyEntityCustomFields } from "@shared/commonLevelModels";
import { LOG } from "../Logger";
import { clamp } from "../Global";
import { Level } from "./Level";

import CONFIG from "../../config.json";

export class Player extends Entity {
	public id: number;
	public nick: string;
	public playerID: number;
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

		this.id = id;
		this.nick = nick;

		this.isDynamic = true;
	}

	protected override onRightCollision(overlap: number, other: Entity) {
		// super.onRightCollision(overlap, other);
	}

	protected override onLeftCollision(overlap: number, other: Entity) {
		// super.onLeftCollision(overlap, other);
	}

	protected override onUpCollision(overlap: number, other: Entity) {
		// super.onUpCollision(overlap, other);
	}

	protected override onDownCollision(overlap: number, other: Entity) {
		// super.onDownCollision(overlap, other);
	}

	public override calculateVelocities() {
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
				this.velocity.y = -PLAYER_CONFIG.JUMP_FORCE;
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

		this.isGrounded = false;
		this.isPushing = false;
	}

	/**  1 - right | -1 - left */
	public getPlayersBehind(direction: 1 | -1, players: Player[]) {
		let theList: Player[] = [];

		const maxXDiffrence = direction * (PLAYER_CONFIG.WIDTH + 5);
		const maxYDiffrence = PLAYER_CONFIG.HEIGHT;

		players.forEach((p) => {
			const isBehind =
				Math.abs(p.pos.x - this.pos.x) <= maxXDiffrence &&
				Math.abs(p.pos.y - this.pos.y) <= maxYDiffrence;

			const isPlayerGoingTowards =
				(direction == 1 && p.lastInputs.right) || (direction == -1 && p.lastInputs.left);

			if (isBehind && isPlayerGoingTowards) {
				theList.push(p);
			}
		});

		return theList;
	}

	public clone() {
		LOG.warn("You shouldn't use .clone() on a Player. It only returns a reference");
		return this;
	}
}
