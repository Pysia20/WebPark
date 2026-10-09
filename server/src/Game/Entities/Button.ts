import { Vector2 } from "@shared/commonModels";
import { Player } from "../Player";
import { Entity } from "./Entity";
import { isColliding } from "../../Global";
import { EntityCustomFieldsData, EntityType, MapCollider } from "@shared/commonLevelModels";
import { PLAYER_CONFIG } from "@shared/commonVariables";
import { Level } from "../Level";
import { runInThisContext } from "node:vm";
import { LOG } from "../../Logger";
import { ServerButtonData } from "@shared/commonEntityData";

export class Button extends Entity {
	public override type: EntityType = "Button";
	public playersStanding: Player[] = [];
	public newList: Player[] = [];
	public hasChanged: boolean = false;

	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields);

		this.validateCustomFields();
	}

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
						this.newList.push(p);
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
				this.newList.push(p);
				playerNewVel.y = 0;
			}
		}

		return isGrounded;
	}

	public isPressed(): boolean {
		return this.playersStanding.length > 0;
	}

	public override clone(): Button {
		return new Button(this.pos, this.size, this.customFields);
	}

	public override endTick() {}

	public override handleBehaviour(l: Level) {
		if (this.customFields.ActivationGroup === undefined) return;

		const prevCount = l.activationStates.get(this.customFields.ActivationGroup)!;

		if (this.newList.length > 0 && this.playersStanding.length == 0) {
			l.activationStates.set(this.customFields.ActivationGroup, prevCount + 1);
		} else if (this.newList.length == 0 && this.playersStanding.length > 0) {
			l.activationStates.set(this.customFields.ActivationGroup, prevCount - 1);
		}

		this.playersStanding = this.newList;
		this.newList = [];
	}

	public override getData(): ServerButtonData {
		return {
			type: this.type,
			pos: this.pos,
			visualSize: this.visualSize,
			isPressed: this.isPressed(),
		};
	}

	public override validateCustomFields() {
		const requiredFields = [
			{
				name: "ActivationGroup",
				value: this.customFields.ActivationGroup,
				isMissing: (v: any) => v === "" || v === undefined,
			},
		];

		for (let field of requiredFields) {
			if (field.isMissing(field.value)) {
				LOG.info(
					`Button doesn't have an '${field.name}' custom field. (${this.pos.x}, ${this.pos.y})`,
				);
				return false;
			}
		}

		return true;
	}
}
