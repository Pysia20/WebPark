import { Vector2 } from "@shared/commonModels";
import { Level } from "../Level";
import {
	Direction,
	DirectionOppositeMap,
	EntityCustomFieldsData,
	EntityType,
} from "@shared/commonLevelModels";
import { PLAYER_CONFIG, WORLD_CONFIG } from "@shared/commonVariables";
import { clamp, RequiredField } from "../../Global";
import { Entity } from "../Entity";
import CONFIG from "../../../config.json";

export class MovingPlatform extends Entity {
	public override type: EntityType = "MovingPlatform";

	public startPos: Vector2;
	public endPos: Vector2;
	public timer: number = 0;
	public reversed: boolean = true;
	public readonly speed: number;
	public shouldRun: boolean = false;

	public override getUsedFields(): RequiredField[] {
		return [
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
				isMissing: (v: any) => v === undefined,
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
	}

	private isActivated: boolean = true;
	private changedThisTick: boolean = false;
	private thingsStanding: Entity[] = [];

	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields, "MovingPlatform");

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
			this.endPos.y -= this.customFields.Distance.value! * WORLD_CONFIG.CELL_SIZE;
		else if (customFields.Direction.value == "Down")
			this.endPos.y += this.customFields.Distance.value! * WORLD_CONFIG.CELL_SIZE;
	}

	protected override onUpCollision(overlap: number, other: Entity) {
		super.onUpCollision(overlap, other);

		if (!this.thingsStanding.includes(other)) this.thingsStanding.push(other);
	}

	protected override onUpTouching(other: Entity) {
		if (!this.thingsStanding.includes(other)) this.thingsStanding.push(other);
	}

	public override handleBehaviour(l: Level) {
		if (
			this.customFields.ActivationGroup.doesExist &&
			this.customFields.ActivationCount.doesExist
		) {
			const group = this.customFields.ActivationGroup.value;
			const count = this.customFields.ActivationCount.value;

			const activaitonCount = l.activationStates.get(group!);

			const currentState = activaitonCount! >= count!;

			if (currentState != this.isActivated) {
				this.changedThisTick = true;
			}

			if (this.changedThisTick) {
				if (currentState) {
					this.isActivated = true;
					this.reversed = !this.reversed;

					this.timer = this.customFields.Cooldown.value!;
				} else {
					if (!this.customFields.StaysOn.value) {
						this.isActivated = false;
					}
				}

				this.changedThisTick = false;
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

		this.thingsStanding.forEach((e) => {
			if (currentDirection == "Left") e.pos.x -= this.speed;
			else if (currentDirection == "Right") e.pos.x += this.speed;
			else if (currentDirection == "Up") e.pos.y -= this.speed;
			else if (currentDirection == "Down") e.pos.y += this.speed;
		});

		if (currentDirection == "Left") this.pos.x -= this.speed;
		else if (currentDirection == "Right") this.pos.x += this.speed;
		else if (currentDirection == "Up") this.pos.y -= this.speed;
		else if (currentDirection == "Down") this.pos.y += this.speed;

		if (this.startPos.x < this.endPos.x) {
			this.pos.x = clamp(this.pos.x, this.startPos.x, this.endPos.x);
		} else {
			this.pos.x = clamp(this.pos.x, this.endPos.x, this.startPos.x);
		}

		if (this.startPos.y < this.endPos.y) {
			this.pos.y = clamp(this.pos.y, this.startPos.y, this.endPos.y);
		} else {
			this.pos.y = clamp(this.pos.y, this.endPos.y, this.startPos.y);
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

		this.thingsStanding = [];
	}

	public override clone() {
		return new MovingPlatform({ ...this.pos }, { ...this.size }, { ...this.customFields });
	}
}
