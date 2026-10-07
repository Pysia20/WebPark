import { Vector2 } from "@shared/commonModels";
import { Level } from "../Level";
import { Entity } from "./Entity";
import { EntityCustomFieldsData, MapCollider } from "@shared/commonLevelModels";
import { PLAYER_CONFIG, PUSHABLE_CONFIG } from "@shared/commonVariables";
import { isColliding } from "../../Global";
import { Player } from "../Player";

//TODO Add colision with other entities

export class Pushable extends Entity {
	public isGrounded: boolean = false;
	public velocity: Vector2 = { x: 0, y: 0 };

	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields);
	}

	public override handleCollisions(
		p: Player,
		playerNewPos: Vector2,
		playerNewVel: Vector2,
		isGrounded: boolean,
	): boolean {
		const { overlapX, overlapY, diffX, diffY } = isColliding(p, this);

		if (overlapX != -1 && overlapY != -1) {
			if (overlapX < overlapY) {
				// Horizontal collison

				if (diffX > 0) {
					// A is going left towards B
					// Pushing out to the right

					if (playerNewVel.x < 0) {
						// playerNewPos.x += overlapX;
						// playerNewVel.x = 0;
						this.pos.x -= overlapX;
					}
				} else {
					// A is going right towards B
					// Pushing out to the left
					if (playerNewVel.x > 0) {
						// playerNewPos.x -= overlapX;
						// playerNewVel.x = 0;
						this.pos.x += overlapX;
					}
				}
			} else {
				// Vertical collision
				if (diffY > 0) {
					// A is going up towards B
					// Pushing out downwards
					if (playerNewVel.y < 0) {
						playerNewPos.y += overlapY;
						playerNewVel.y = 0;
					}
				} else {
					// A is goung down towards B
					// Pushign out upwards

					if (playerNewVel.y > 0) {
						playerNewPos.y -= overlapY;
						playerNewVel.y = 0;
						isGrounded = true;
						this.isGrounded = true;
					}
				}
			}
		} else if (!isGrounded) {
			const collider: MapCollider = new MapCollider(
				p.pos.x,
				p.pos.y + PLAYER_CONFIG.GROUND_DETECTON_OFFSET,
				PLAYER_CONFIG.WIDTH,
				PLAYER_CONFIG.HEIGHT,
			);

			const { overlapX, overlapY, diffX, diffY } = isColliding(collider, this);

			if (overlapY != -1) {
				isGrounded = true;
				this.isGrounded = true;
				playerNewVel.y = 0;
			}
		}

		return isGrounded;
	}

	public override handleBehaviour(l: Level) {
		l.entities.forEach((e) => {
			if (e === this) return;
			this.handleEntityCollisions(e);
		});
		this.applyPhysics();
	}

	private applyPhysics() {
		if (this.velocity.x > PUSHABLE_CONFIG.DRAG) {
			this.velocity.x -= PUSHABLE_CONFIG.DRAG;
		} else if (this.velocity.x < -PUSHABLE_CONFIG.DRAG) {
			this.velocity.x += PUSHABLE_CONFIG.DRAG;
		} else {
			this.velocity.x = 0;
		}

		if (!this.isGrounded) {
			this.velocity.y += PUSHABLE_CONFIG.GRAVITY;
		}
	}

	private handleEntityCollisions(e2: Entity) {
		const { overlapX, overlapY, diffX, diffY } = isColliding(e2, this);

		if (overlapX != -1 && overlapY != -1) {
			if (overlapX < overlapY) {
				// Horizontal collison

				if (diffX > 0) {
					// A is going left towards B
					// Pushing out to the right

					if (this.velocity.x < 0) {
						// playerNewPos.x += overlapX;
						// playerNewVel.x = 0;
						this.pos.x -= overlapX;
					}
				} else {
					// A is going right towards B
					// Pushing out to the left
					if (this.velocity.x > 0) {
						// playerNewPos.x -= overlapX;
						// playerNewVel.x = 0;
						this.pos.x += overlapX;
					}
				}
			} else {
				// Vertical collision
				if (diffY > 0) {
					// A is going up towards B
					// Pushing out downwards
					if (this.velocity.y < 0) {
						this.velocity.y += overlapY;
						this.velocity.y = 0;
					}
				} else {
					// A is goung down towards B
					// Pushign out upwards

					if (this.velocity.y > 0) {
						this.velocity.y -= overlapY;
						this.velocity.y = 0;
						this.isGrounded = true;
					}
				}
			}
		} else if (!this.isGrounded) {
			const collider: MapCollider = new MapCollider(
				this.pos.x,
				this.pos.y + PUSHABLE_CONFIG.GROUND_DETECTON_OFFSET,
				this.size.x,
				this.size.y,
			);

			const { overlapX, overlapY, diffX, diffY } = isColliding(collider, this);

			if (overlapY != -1) {
				this.isGrounded = true;
				this.velocity.y = 0;
			}
		}
	}

	public override endTick() {
		this.isGrounded = false;
	}

	public override clone() {
		return new Pushable(this.pos, this.size, this.customFields);
	}
}
