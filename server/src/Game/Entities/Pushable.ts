import { Vector2 } from "@shared/commonModels";
import { Level } from "../Level";
import { Entity } from "./Entity";
import { EntityCustomFieldsData, EntityType, MapCollider } from "@shared/commonLevelModels";
import { PLAYER_CONFIG, PUSHABLE_CONFIG } from "@shared/commonVariables";
import { isColliding } from "../../Global";
import { Player } from "../Player";
import CONFIG from "../../../config.json";

//TODO Add colision with other entities

export class Pushable extends Entity {
	public override type: EntityType = "Pushable";

	public isGrounded: boolean = false;
	public velocity: Vector2 = { x: 0, y: 0 };

	public pusher: Player | undefined;
	public pusherNewPos: Vector2 | undefined;

	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields);
		this.customFields = this.validateCustomFields(customFields);
	}

	public override handleCollisions(
		p: Player,
		playerNewPos: Vector2,
		playerNewVel: Vector2,
		isGrounded: boolean,
	): boolean {
		const { overlapX, overlapY, diffX, diffY } = isColliding(p, this);

		let newPos: Vector2 = { ...this.pos };

		if (overlapX != -1 && overlapY != -1) {
			if (overlapX < overlapY) {
				// Horizontal collison

				if (diffX > 0) {
					// A is going left towards B
					// Pushing out to the right

					if (playerNewVel.x < 0) {
						// playerNewPos.x += overlapX;
						// playerNewVel.x = 0;
						newPos.x -= overlapX;
						this.pusher = p;
						this.pusherNewPos = playerNewPos;
					}
				} else {
					// A is going right towards B
					// Pushing out to the left
					if (playerNewVel.x > 0) {
						// playerNewPos.x -= overlapX;
						// playerNewVel.x = 0;
						newPos.x += overlapX;
						this.pusher = p;
						this.pusherNewPos = playerNewPos;
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

		this.pos = newPos;

		return isGrounded;
	}

	public override handleBehaviour(l: Level) {
		let newPos: Vector2 = { x: this.pos.x, y: this.pos.y };
		this.isGrounded = false;

		this.applyPhysics(newPos);

		this.pos = { ...newPos };
	}

	private applyPhysics(newPos: Vector2) {
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

		let TheGrandArray: (Player | MapCollider | Entity)[] = this.level?.getColliders()!;
		TheGrandArray = [...TheGrandArray, ...this.level?.room.getPlayers()!.values()!];
		TheGrandArray = [...TheGrandArray, ...this.level?.entities!];

		TheGrandArray.forEach((c) => {
			this.handleEntityCollisions(c, newPos, this.pusher, this.pusherNewPos);
		});

		newPos.x += this.velocity.x * (1 / CONFIG.TICKRATE);
		newPos.y += this.velocity.y * (1 / CONFIG.TICKRATE);

		this.pos = newPos;
	}

	private handleEntityCollisions(
		e2: Entity | MapCollider | Player,
		newPos: Vector2,
		pusher: Player | undefined,
		pusherNewPos: Vector2 | undefined,
	) {
		if (e2 === this) return;
		if (e2 === pusher) return;
		const { overlapX, overlapY, diffX, diffY } = isColliding(e2, this);

		if (overlapX != -1 && overlapY != -1) {
			// console.log("Pushable collides");
			if (overlapX < overlapY) {
				// Horizontal collison

				if (diffX > 0) {
					// A is going left towards B
					// Pushing out to the right

					newPos.x -= overlapX;
					this.velocity.x = 0;
					if (pusherNewPos) {
						pusherNewPos.x -= overlapX;
					}
				} else {
					// A is going right towards B
					// Pushing out to the left
					newPos.x += overlapX;
					this.velocity.x = 0;

					if (pusherNewPos) {
						pusherNewPos.x += overlapX;
					}
				}
			} else {
				// Vertical collision
				if (diffY > 0) {
					// A is going up towards B
					// Pushing out downwards
					newPos.y -= overlapY;
					this.velocity.y = 0;
				} else {
					// A is goung down towards B
					// Pushign out upwards

					newPos.y += overlapY;
					this.velocity.y = 0;
					this.isGrounded = true;
					if (e2 instanceof Entity) {
						e2.entityStanding(this);
					}
				}
			}
		} else if (!this.isGrounded) {
			const collider: MapCollider = new MapCollider(
				newPos.x,
				newPos.y + PUSHABLE_CONFIG.GROUND_DETECTON_OFFSET,
				this.size.x,
				this.size.y,
			);

			const { overlapX, overlapY, diffX, diffY } = isColliding(collider, e2);

			if (overlapY != -1) {
				this.isGrounded = true;
				this.velocity.y = 0;
				if (e2 instanceof Entity) {
					e2.entityStanding(this);
				}
			}
		}
	}

	public override endTick() {
		this.isGrounded = false;
		this.pusher = undefined;
		this.pusherNewPos = undefined;
	}

	public override clone() {
		return new Pushable({ ...this.pos }, { ...this.size }, { ...this.customFields });
	}
}
