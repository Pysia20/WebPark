import { Vector2 } from "@shared/commonModels";
import { Level } from "../Level";
import { Entity } from "./Entity";
import { EntityCustomFieldsData, EntityType, MapCollider } from "@shared/commonLevelModels";
import { PLAYER_CONFIG, WORLD_CONFIG } from "@shared/commonVariables";
import { isColliding } from "../../Global";
import { Player } from "../Player";
import { LOG } from "../../Logger";

export class MovingPlatform extends Entity {
	public override type: EntityType = "MovingPlatform";

	public readonly startPos: Vector2;
	public readonly endPos: Vector2;
	public readonly timer: number = 0;

	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields);
		this.validateCustomFields();

		this.startPos = { ...this.pos };

		if (customFields.Direction == "Up" || customFields.Direction == "Down") {
			this.endPos = {
				...this.pos,
				y: this.pos.y + customFields.Distance! * WORLD_CONFIG.CELL_SIZE,
			};
		} else {
			this.endPos = {
				...this.pos,
				x: this.pos.x + customFields.Distance! * WORLD_CONFIG.CELL_SIZE,
			};
		}
	}

	public override handleBehaviour(l: Level) {}

	public override endTick() {}

	public override clone() {
		return new MovingPlatform(this.pos, this.size, this.customFields);
	}

	public override validateCustomFields() {
		const requiredFields = [
			{
				name: "ActivationGroup",
				value: this.customFields.ActivationGroup,
				isMissing: (v: any) => v === "" || v === undefined,
			},
			{
				name: "ActivationCount",
				value: this.customFields.ActivationCount,
				isMissing: (v: any) => v === 0 || v === undefined,
			},
			{
				name: "StaysOn",
				value: this.customFields.StaysOn,
				isMissing: (v: any) => v === undefined,
			},
			{
				name: "Direction",
				value: this.customFields.Direction,
				isMissing: (v: any) => v === undefined,
			},
			{
				name: "Speed",
				value: this.customFields.Speed,
				isMissing: (v: any) => v === undefined || v <= 0,
			},
			{
				name: "Distance",
				value: this.customFields.Distance,
				isMissing: (v: any) => v === undefined || v <= 0,
			},
			{
				name: "Cooldown",
				value: this.customFields.Distance,
				isMissing: (v: any) => v === undefined || v < 0,
			},
		];

		for (let field of requiredFields) {
			if (field.isMissing(field.value)) {
				LOG.info(
					`ButtonDoor doesn't have an '${field.name}' custom field or it's value is invalid. (${this.pos.x}, ${this.pos.y})`,
				);
				throw Error(
					`ButtonDoor doesn't have an '${field.name}' custom field or it's value is invalid. (${this.pos.x}, ${this.pos.y})`,
				);
				return false;
			}
		}

		return true;
	}
}
