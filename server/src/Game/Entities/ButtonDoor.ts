import { EntityCustomFieldsData, EntityType, MapCollider } from "@shared/commonLevelModels";
import { Entity } from "./Entity";
import { Vector2 } from "@shared/commonModels";
import { LOG } from "../../Logger";
import { Player } from "../Player";
import { isColliding } from "../../Global";
import { PLAYER_CONFIG } from "@shared/commonVariables";
import { Level } from "../Level";
import { ServerButtonDoorData } from "@shared/commonEntityData";

export class ButtonDoor extends Entity {
	public override type: EntityType = "ButtonDoor";
	public isPassable: boolean = false;

	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields);

		if (customFields.ActivationGroup == "" || customFields.ActivationGroup === undefined) {
			LOG.warn(
				`ButtonDoor doesn't have an activationGroup. (X: ${this.size.x}, Y: ${this.size.y})`,
			);
		}

		if (customFields.ActivationCount == 0 || customFields.ActivationCount === undefined) {
			LOG.warn(
				`ButtonDoor doesn't have an activationCount. (X: ${this.size.x}, Y: ${this.size.y})`,
			);
		}
	}

	public override handleCollisions(
		p: Player,
		playerNewPos: Vector2,
		playerNewVel: Vector2,
		isGrounded: boolean,
	): boolean {
		if (this.isPassable) return false;

		const { overlapX, overlapY, diffX, diffY } = isColliding(p, this);

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
				playerNewVel.y = 0;
			}
		}

		return isGrounded;
	}

	public override clone() {
		return new ButtonDoor(this.pos, this.size, this.customFields);
	}

	public override handleBehaviour(l: Level) {
		if (this.customFields.ActivationGroup === undefined) return;
		if (this.customFields.ActivationCount === undefined) return;

		if (
			this.customFields.ActivationCount != -1 &&
			this.customFields.ActivationCount <=
				l.activationStates.get(this.customFields.ActivationGroup)!
		) {
			this.isPassable = true;
		} else {
			if (!this.customFields.StaysOpen) {
				this.isPassable = false;
			}
		}
	}

	public override getData(): ServerButtonDoorData {
		return {
			pos: this.pos,
			visualSize: this.size,
			type: this.type,
			isOpen: this.isPassable,
		};
	}
}
