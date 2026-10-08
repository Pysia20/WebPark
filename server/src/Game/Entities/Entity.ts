import { ServerEntityData, Vector2 } from "@shared/commonModels";
import { Player } from "../Player";
import { PLAYER_CONFIG } from "@shared/commonVariables";
import { isColliding } from "../../Global";
import { LOG } from "../../Logger";
import { EntityCustomFieldsData, EntityType, MapCollider } from "@shared/commonLevelModels";
import { EntityBuilder } from "./EntityBuilder";
import { Level } from "../Level";

export class Entity {
	public readonly type: EntityType = "JohnEntity";
	public readonly pos: Vector2;
	public readonly size: Vector2;
	public visualSize: Vector2;
	public customFields: EntityCustomFieldsData;

	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		this.pos = pos;
		this.size = size;
		this.visualSize = this.size;
		this.customFields = customFields;
	}

	/**
	 * * Entity: Should be overriten on children
	 *
	 * @param p
	 * @param playerNewPos
	 * @param playerNewVel
	 */
	public handleCollisions(
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

	/**
	 * * Entity: Should be overriten on children
	 */
	public clone(): Entity {
		return new Entity(this.pos, this.size, this.customFields);
	}

	public getTypeName(): string {
		return this.constructor.name;
	}

	/**
	 * * Entity: Should be overriten on children
	 */
	public handleBehaviour(l: Level) {}

	/**
	 * * Entity: Should be overriten on children
	 */
	public endTick() {}

	/**
	 * * Entity: Should be overriten on children
	 */
	public getData(): ServerEntityData {
		return {
			type: this.type,
			pos: this.pos,
			visualSize: this.visualSize,
		};
	}
}
