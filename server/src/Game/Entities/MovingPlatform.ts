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
import { clamp, isColliding, RequiredField } from "../../Global";
import { Player } from "../Player";
import { LOG } from "../../Logger";
import e from "cors";

export class MovingPlatform extends Entity {
	public override type: EntityType = "MovingPlatform";

	public startPos: Vector2;
	public endPos: Vector2;
	public timer: number = 0;
	public reversed: boolean = true;
	public readonly speed: number;
	public shouldRun: boolean = false;

	public readonly usedFields: RequiredField[] = [
		{
			name: "ActivationGroup",
			value: this.customFields.ActivationGroup,
			isMissing: (v: any) => v === "" || v === undefined || v == null,
			isRequired: false,
		},
		{
			name: "ActivationCount",
			value: this.customFields.ActivationCount,
			isMissing: (v: any) => v === 0 || v === undefined || v == null,
			isRequired: false,
		},
		{
			name: "StaysOn",
			value: this.customFields.StaysOn,
			isMissing: (v: any) => v === undefined || v == null,
			isRequired: false,
		},
		{
			name: "Direction",
			value: this.customFields.Direction,
			isMissing: (v: any) => v === undefined || v == null,
			isRequired: true,
		},
		{
			name: "Speed",
			value: this.customFields.Speed,
			isMissing: (v: any) => v === undefined || v <= 0 || v == null,
			isRequired: true,
		},
		{
			name: "Distance",
			value: this.customFields.Distance,
			isMissing: (v: any) => v === undefined || v <= 0 || v == null,
			isRequired: true,
		},
		{
			name: "Cooldown",
			value: this.customFields.Distance,
			isMissing: (v: any) => v === undefined || v < 0 || v == null,
			isRequired: true,
		},
	] as const;

	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields);

		this.speed = this.customFields.Speed.value!;
		this.startPos = { ...this.pos };
		this.endPos = { ...this.pos };

		if (customFields.Direction.value == "Right")
			this.endPos.x += this.customFields.Distance.value! * WORLD_CONFIG.CELL_SIZE;
		else if (customFields.Direction.value == "Left")
			this.endPos.x -= this.customFields.Distance.value! * WORLD_CONFIG.CELL_SIZE;
		else if (customFields.Direction.value == "Up")
			this.endPos.x -= this.customFields.Distance.value! * WORLD_CONFIG.CELL_SIZE;
		else if (customFields.Direction.value == "Down")
			this.endPos.y += this.customFields.Distance.value! * WORLD_CONFIG.CELL_SIZE;
	}

	public override handleBehaviour(l: Level) {
		// Activation states needs to be added

		if (
			this.customFields.ActivationGroup.doesExist &&
			this.customFields.ActivationCount.doesExist
		) {
			const group = this.customFields.ActivationGroup.value;
			const count = this.customFields.ActivationCount.value;

			if (l.activationStates.get(group!)! < count!) {
				this.timer = 0;
				return;
			}
		}

		if (this.timer < this.customFields.Cooldown.value!) {
			this.timer++;
			if (this.timer >= this.customFields.Cooldown.value!) {
				this.reversed = !this.reversed;
			}
			return;
		}

		let currentDirection: Direction = this.reversed
			? DirectionOppositeMap[this.customFields.Direction.value!]
			: this.customFields.Direction.value!;

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
}
