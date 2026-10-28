import { PlayerInputs, Vector2 } from "@shared/commonModels";
import { Entity } from "./Entity";
import { COLLISION_MARGIN_Y, PLAYER_CONFIG } from "@shared/commonVariables";
import { DummyEntityCustomFields } from "@shared/commonLevelModels";
import { LOG } from "../Logger";
import { clamp } from "../Global";
import { BoorEnt } from "../../../client/src/Entities/Boor";

export class Player extends Entity {
	public nick: string;
	public playerID: number;
	public pos: Vector2 = { x: 0, y: 0 };
	public color: string = "";
	public roomID: string | undefined;
	public isReady: boolean = false;
	public isInsideDoor: boolean = false;
	public jumpBuffered: boolean = false;
	public lastGroundedFrameTime: number = -1;

	public oldInputs: PlayerInputs = {
		right: false,
		left: false,
		jump: false,
		cursorPos: { x: -1, y: -1 },
	};

	public jumpHeldSinceTakeoff: boolean = false;
	public jumpFrames: number = 0;

	public currentInputs: PlayerInputs = {
		right: false,
		left: false,
		jump: false,
		cursorPos: { x: -1, y: -1 },
	};

	constructor(playerID: number, nick: string) {
		super(
			{ x: 0, y: 0 },
			{ x: PLAYER_CONFIG.WIDTH, y: PLAYER_CONFIG.HEIGHT },
			DummyEntityCustomFields,
			"Player",
		);

		this.playerID = playerID;
		this.nick = nick;
		this.isDynamic = true;
	}

	public setInputs(newInputs: PlayerInputs) {
		this.oldInputs = this.currentInputs;
		this.currentInputs = newInputs;
	}

	protected override onRightCollision(overlap: number, other: Entity) {}

	protected override onLeftCollision(overlap: number, other: Entity) {}

	protected override onUpCollision(overlap: number, other: Entity) {}

	protected override onDownCollision(overlap: number, other: Entity) {}

	public checkJumpBuffering(other: Entity) {
		if (!this.currentInputs.jump || this.isGrounded || this.velocity.y <= 0) return;

		const jumpBufferDistance = Math.abs(this.velocity.y) * PLAYER_CONFIG.JUMP_BUFFER_TIME;

		const pos = { ...this.pos };
		pos.y += jumpBufferDistance;
		const size = { ...this.size };

		const { collidesX, collidesY } = Entity.isColliding({ pos, size }, other);

		if (collidesX && collidesY) this.jumpBuffered = true;
	}

	private checkCoyoteFrame(): boolean {
		return new Date().getTime() - this.lastGroundedFrameTime <= PLAYER_CONFIG.COYOTE_TIME;
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
			if (this.currentInputs.right) {
				this.velocity.x += PLAYER_CONFIG.ACCELERATION;
			}
			if (this.currentInputs.left) {
				this.velocity.x -= PLAYER_CONFIG.ACCELERATION;
			}
			// Jump when:
			// Space / Buffer + Grounded / Coyote Frame
			// Space hold for max of JUMP_FRAMES_MAX.

			const initialJumpCondition =
				(this.currentInputs.jump || this.jumpBuffered) &&
				(this.isGrounded || this.checkCoyoteFrame());

			if (initialJumpCondition) {
				this.velocity.y = -PLAYER_CONFIG.JUMP_FORCE;
				this.isGrounded = false;
				this.jumpBuffered = false;
				this.jumpHeldSinceTakeoff = true;
			}

			const holdingJumpCondition =
				this.currentInputs.jump &&
				this.oldInputs.jump &&
				this.jumpHeldSinceTakeoff &&
				this.jumpFrames <= PLAYER_CONFIG.JUMP_FRAMES_MAX;

			// console.log(`
			// 	CURRENT: ${this.currentInputs.jump}
			// 	OLD: ${this.oldInputs.jump}
			// 	SIENCE: ${this.jumpHeldSinceTakeoff}
			// 	FRAMES: ${this.jumpFrames}
			// 	`);

			if (holdingJumpCondition) {
				this.velocity.y = -PLAYER_CONFIG.JUMP_FORCE;
				this.jumpFrames++;
			} else {
				this.jumpHeldSinceTakeoff = false;
				this.jumpFrames = 0;
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
				(direction == 1 && p.currentInputs.right) || (direction == -1 && p.currentInputs.left);

			if (isBehind && isPlayerGoingTowards) {
				theList.push(p);
			}
		});

		return theList;
	}

	public override setGrounded() {
		this.isGrounded = true;
		this.lastGroundedFrameTime = new Date().getTime();
	}

	public endTick() {
		super.endTick();
		this.oldInputs = { ...this.currentInputs };
	}

	public clone() {
		LOG.warn("You shouldn't use .clone() on a Player. It only returns a reference");
		return this;
	}
}
