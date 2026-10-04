import { Vector2 } from "@shared/commonModels";
import { Player } from "../Player";
import { Entity } from "./Entity";
import { isColliding } from "../../Global";
import { EntityType, MapCollider } from "@shared/commonLevelModels";
import { PLAYER_CONFIG } from "@shared/commonVariables";

export class Button extends Entity {
	public override type: EntityType = "Button";
	public isPressed: boolean = false;
	public hasChanged: boolean = false;
	public hasChangedThisTick: boolean = false;

	constructor(pos: Vector2, size: Vector2, activationGroup: string) {
		super(pos, size);
		this.visualSize = { x: this.size.x * 2, y: this.size.y * 2 };
		this.activationGroup = activationGroup;
	}

	public handleCollisions(
		p: Player,
		playerNewPos: Vector2,
		playerNewVel: Vector2,
		isGrounded: boolean,
	): boolean {
		const { overlapX, overlapY, diffX, diffY } = isColliding(p, this);
		let newState: boolean = false;

		if (overlapX != -1 && overlapY != -1) {
			if (overlapX < overlapY) {
				// Horizontal collison

				if (diffX > 0) {
					// A is going left towards B
					// Pushing out to the right

					if (playerNewVel.x < 0) {
						playerNewPos.x += overlapX;
						playerNewVel.x = 0;
					}
				} else {
					// A is going right towards B
					// Pushing out to the left
					if (playerNewVel.x > 0) {
						playerNewPos.x -= overlapX;
						playerNewVel.x = 0;
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
						newState = true;
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
				newState = true;
				playerNewVel.y = 0;
			}
		}

		if (!this.hasChangedThisTick) {
			if (newState != this.isPressed && this.hasChanged != true) {
				this.hasChanged = true;
				this.isPressed = newState;
			}
		}

		return isGrounded;
	}

	public override clone(): Button {
		return new Button(this.pos, this.size, this.activationGroup);
	}

	public endTick() {
		this.hasChanged = false;
		this.hasChangedThisTick = false;
	}
}
