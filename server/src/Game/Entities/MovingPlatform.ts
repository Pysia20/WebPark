import { Vector2 } from "@shared/commonModels";
import { Level } from "../Level";
import { JohnEntity } from "./JohnEntity";
import {
	Direction,
	DirectionOppositeMap,
	EntityCustomFieldsData,
	EntityType,
} from "@shared/commonLevelModels";
import { PLAYER_CONFIG, WORLD_CONFIG } from "@shared/commonVariables";
import { clamp, isColliding, RequiredField } from "../../Global";
import { Player } from "../Player";
import { LOG } from "../../Logger";
import e from "cors";

export class MovingPlatform extends JohnEntity {
	public override type: EntityType = "MovingPlatform";

	public startPos: Vector2;
	public endPos: Vector2;
	public timer: number = 0;
	public reversed: boolean = false;
	public readonly speed: number;
	public shouldRun: boolean = false;

	public readonly usedFields: RequiredField[] = [
		{
			name: "ActivationGroup",
			value: this.customFields.ActivationGroup.value,
			isMissing: (v: any) => v === "" || v === undefined || !v,
			isRequired: false,
		},
		{
			name: "ActivationCount",
			value: this.customFields.ActivationCount.value,
			isMissing: (v: any) => v === 0 || v === undefined || !v,
			isRequired: false,
		},
		{
			name: "StaysOn",
			value: this.customFields.StaysOn.value,
			isMissing: (v: any) => v === undefined || !v,
			isRequired: false,
		},
		{
			name: "Direction",
			value: this.customFields.Direction.value,
			isMissing: (v: any) => v === undefined || !v,
			isRequired: true,
		},
		{
			name: "Speed",
			value: this.customFields.Speed.value,
			isMissing: (v: any) => v === undefined || v <= 0 || !v,
			isRequired: true,
		},
		{
			name: "Distance",
			value: this.customFields.Distance.value,
			isMissing: (v: any) => v === undefined || v <= 0 || !v,
			isRequired: true,
		},
		{
			name: "Cooldown",
			value: this.customFields.Distance.value,
			isMissing: (v: any) => v === undefined || v < 0 || !v,
			isRequired: true,
		},
	] as const;

	private isActivated: boolean = true;
	private changedThisTick: boolean = false;

	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields);
		this.customFields = this.validateCustomFields(customFields);

		if (
			this.customFields.ActivationCount.doesExist &&
			this.customFields.ActivationGroup.doesExist
		) {
			this.isActivated = false;
		}

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
		if (
			this.customFields.ActivationGroup.doesExist &&
			this.customFields.ActivationCount.doesExist
		) {
			const group = this.customFields.ActivationGroup.value;
			const count = this.customFields.ActivationCount.value;

			const activaitonCount = l.activationStates.get(group!);

			if (activaitonCount! >= count! != this.isActivated) {
				this.changedThisTick = true;
			}

			if (this.changedThisTick) {
				if (activaitonCount! >= count!) {
					this.isActivated = true;
				} else {
					this.isActivated = false;
				}

				if (this.isActivated) {
					this.timer = this.customFields.Cooldown.value!;

					this.changedThisTick = false;
				}
			}
		}

		if (!this.isActivated) return;

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
