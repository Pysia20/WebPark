import { EntityCustomFieldsData, EntityType, MapCollider } from "@shared/commonLevelModels";
import { JohnEntity } from "./JohnEntity";
import { Vector2 } from "@shared/commonModels";
import { LOG } from "../../Logger";
import { Player } from "../Player";
import { isColliding, RequiredField } from "../../Global";
import { PLAYER_CONFIG } from "@shared/commonVariables";
import { Level } from "../Level";
import { ServerButtonDoorData } from "@shared/commonEntityData";
import { z } from "zod";

export class ButtonDoor extends JohnEntity {
	public override type: EntityType = "ButtonDoor";
	public isPassable: boolean = false;

	public readonly usedFields: RequiredField[] = [
		{
			name: "ActivationGroup",
			value: this.customFields.ActivationGroup.value,
			isMissing: (v: any) => v === "" || v === undefined || !v,
			isRequired: true,
		},
		{
			name: "ActivationCount",
			value: this.customFields.ActivationCount.value,
			isMissing: (v: any) => v === 0 || v === undefined || !v,
			isRequired: true,
		},
		{
			name: "StaysOn",
			value: this.customFields.StaysOn.value,
			isMissing: (v: any) => v === undefined,
			isRequired: true,
		},
	];

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
		return new ButtonDoor({ ...this.pos }, { ...this.size }, { ...this.customFields });
	}

	public override handleBehaviour(l: Level) {
		if (
			!this.customFields.ActivationCount.doesExist ||
			!this.customFields.ActivationGroup.doesExist
		) {
			console.log(this.customFields.ActivationGroup);
			console.log(this.customFields.ActivationCount);
			return;
		}

		if (
			this.customFields.ActivationCount.value! <=
			l.activationStates.get(this.customFields.ActivationGroup.value!)!
		) {
			this.isPassable = true;
		} else {
			if (!(this.customFields.StaysOn.doesExist && this.customFields.StaysOn.value)) {
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
