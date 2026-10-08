import { Vector2 } from "@shared/commonModels";
import { Level } from "../Level";
import { Entity } from "./Entity";
import { EntityCustomFieldsData, EntityType, MapCollider } from "@shared/commonLevelModels";
import { PLAYER_CONFIG } from "@shared/commonVariables";
import { isColliding } from "../../Global";
import { Player } from "../Player";
import { LOG } from "../../Logger";

export class Spike extends Entity {
	public shouldKill: boolean = false;

	public override type: EntityType = "Spike";

	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields);

		if (customFields.OnlyKillThePlayer === undefined) {
			LOG.warn(
				`Spike doesn't have an 'OnlyKillThePlayer' property. (X: ${this.size.x}, Y: ${this.size.y})`,
			);
		}
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

			this.shouldKill = true;
		}

		return isGrounded;
	}

	public override handleBehaviour(l: Level) {
		if (this.shouldKill) {
			this.shouldKill = false;
			l.shouldRestart = true;
		}
	}
	public override endTick() {}

	public override clone() {
		return new Spike(this.pos, this.size, this.customFields);
	}
}
