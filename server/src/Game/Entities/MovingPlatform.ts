import { Vector2 } from "@shared/commonModels";
import { Level } from "../Level";
import { Entity } from "./Entity";
import {
	Direction,
	DirectionOppositeMap,
	EntityCustomFieldsData,
	EntityType,
	MapCollider,
} from "@shared/commonLevelModels";
import { PLAYER_CONFIG, WORLD_CONFIG } from "@shared/commonVariables";
import { clamp, isColliding } from "../../Global";
import { Player } from "../Player";
import { LOG } from "../../Logger";

export class MovingPlatform extends Entity {
	public override type: EntityType = "MovingPlatform";

	public startPos: Vector2;
	public endPos: Vector2;
	public timer: number = 0;
	public reversed: boolean = true;
	public readonly speed: number;

	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields);
		this.validateCustomFields();

		this.speed = this.customFields.Speed!;
		this.startPos = { ...this.pos };
		this.endPos = { ...this.pos };

		if (customFields.Direction == "Right")
			this.endPos.x += this.customFields.Distance! * WORLD_CONFIG.CELL_SIZE;
		else if (customFields.Direction == "Left")
			this.endPos.x -= this.customFields.Distance! * WORLD_CONFIG.CELL_SIZE;
		else if (customFields.Direction == "Up")
			this.endPos.x -= this.customFields.Distance! * WORLD_CONFIG.CELL_SIZE;
		else if (customFields.Direction == "Down")
			this.endPos.y += this.customFields.Distance! * WORLD_CONFIG.CELL_SIZE;
	}

	public override handleBehaviour(l: Level) {
		// Activation states needs to be added

		if (this.timer < this.customFields.Cooldown!) {
			this.timer++;
			if (this.timer >= this.customFields.Cooldown!) {
				this.reversed = !this.reversed;
			}
			return;
		}

		let currentDirection: Direction = this.reversed
			? DirectionOppositeMap[this.customFields.Direction!]
			: this.customFields.Direction!;

		if (currentDirection == "Left") this.pos.x -= this.speed;
		else if (currentDirection == "Right") this.pos.x += this.speed;
		else if (currentDirection == "Up") this.pos.y -= this.speed;
		else if (currentDirection == "Down") this.pos.y -= this.speed;

		if (this.startPos.x < this.endPos.x) {
			this.pos.x = clamp(this.pos.x, this.startPos.x, this.endPos.x);
		} else {
			this.pos.x = clamp(this.pos.x, this.startPos.x, this.endPos.x);
		}

		if (this.startPos.y < this.endPos.y) {
			this.pos.y = clamp(this.pos.y, this.startPos.y, this.endPos.y);
		} else {
			this.pos.y = clamp(this.pos.y, this.startPos.y, this.endPos.y);
		}

		if (!this.reversed) {
			if (this.pos.x == this.endPos.x && this.pos.y == this.endPos.y) {
				this.timer = 0;
			}
		} else {
			if (this.pos.x == this.startPos.x && this.pos.y == this.startPos.y) {
				this.timer = 0;
			}
		}
	}

	public override endTick() {}

	public override clone() {
		return new MovingPlatform({ ...this.pos }, { ...this.size }, { ...this.customFields });
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
