import { Vector2 } from "@shared/commonModels";
import { Level } from "../Level";
import { Entity } from "./Entity";
import { EntityCustomFieldsData, EntityType, MapCollider } from "@shared/commonLevelModels";
import { PLAYER_CONFIG } from "@shared/commonVariables";
import { isColliding } from "../../Global";
import { Player } from "../Player";

//! DO NOT IMPORT!!!
//? IT IS A TEMPLATE FOR CREATING NEW ENTITY TYPES
//? IT IS NOT USED ANYWARE IN THE CODEBASE
//TODO Change this name and clone()
//TODO Add the name to the EntityType in commonModels
//TODO Add to the TYPE_MAP in the EntityBuilder

export class ENTITY_NAME extends Entity {
	public override type: EntityType = "JohnEntity";
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

	public override handleBehaviour(l: Level) {}
	public override endTick() {}

	public override clone() {
		return new ENTITY_NAME({ ...this.pos }, { ...this.size }, { ...this.customFields });
	}
}
