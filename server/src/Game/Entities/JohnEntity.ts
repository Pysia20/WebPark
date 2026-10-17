import { ServerEntityData, Vector2 } from "@shared/commonModels";
import { Player } from "../Player";
import { PLAYER_CONFIG } from "@shared/commonVariables";
import { isColliding, RequiredField } from "../../Global";
import { LOG } from "../../Logger";
import { EntityCustomFieldsData, EntityType, MapCollider } from "@shared/commonLevelModels";
import { EntityBuilder } from "./EntityBuilder";
import { Level } from "../Level";

export class JohnEntity {
	public readonly type: EntityType = "JohnEntity";
	public pos: Vector2;
	public readonly size: Vector2;
	public visualSize: Vector2;
	public customFields: EntityCustomFieldsData;
	public level: Level | undefined;

	public readonly usedFields: RequiredField[] = [];

	public id: number = -1;

	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		this.pos = pos;
		this.size = size;
		this.visualSize = this.size;
		this.customFields = this.validateCustomFields(customFields);
	}

	public setLevel(level: Level) {
		this.level = level;
	}

	public validateCustomFields(customFields: EntityCustomFieldsData): EntityCustomFieldsData {
		let newCustomFields: EntityCustomFieldsData = { ...customFields };

		for (let field of this.usedFields) {
			newCustomFields[field.name].doesExist = true;
			if (field.isMissing(field.value)) {
				newCustomFields[field.name].doesExist = false;
				if (field.isRequired) {
					LOG.error(
						`${this.type} doesn't have an '${field.name}' custom field or it's value is invalid. (${this.pos.x}, ${this.pos.y})`,
					);
					throw Error(
						`${this.type} doesn't have an '${field.name}' custom field or it's value is invalid. (${this.pos.x}, ${this.pos.y})`,
					);
				}

				LOG.warn(
					`${this.type} doesn't have an '${field.name}' custom field or it's value is invalid. (${this.pos.x}, ${this.pos.y})`,
				);
			}
		}
		if (this.type == "Laser") {
			// console.log(customFields);
			// console.log(newCustomFields);
		}

		return newCustomFields;
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
	public clone(): JohnEntity {
		return new JohnEntity({ ...this.pos }, { ...this.size }, { ...this.customFields });
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

	public entityStanding(entity: JohnEntity): void {}
}
