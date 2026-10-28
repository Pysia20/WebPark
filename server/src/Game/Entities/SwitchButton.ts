import { Vector2 } from "@shared/commonModels";
import { Entity } from "../Entity";
import { EntityCustomFieldsData } from "@shared/commonLevelModels";
import { RequiredField } from "../../Global";
import { Level } from "../Level";
import { ServerButtonData } from "@shared/commonEntityData";

export class SwitchButton extends Entity {
	public override getUsedFields(): RequiredField[] {
		return [
			{
				name: "ActivationGroups",
				value: this.customFields.ActivationGroups.value,
				isMissing: (v) => !v || v.length == 0,
				isRequired: true,
			},
			{
				name: "ActivatedByDefault",
				value: this.customFields.ActivatedByDefault.value,
				isMissing: (v) => v === undefined,
				isRequired: true,
			},
		];
	}

	public thingsStanding: Entity[] = [];
	public newList: Entity[] = [];
	public hasChanged: boolean = false;
	public currentIndex: number = -1;

	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields, "SwitchButton");
	}

	public override init() {
		if (this.customFields.ActivatedByDefault.value) {
			this.currentIndex = 0;
			const currentValue = this.level?.activationStates.get(
				this.customFields.ActivationGroups.value![0],
			);
			this.level?.activationStates.set(
				this.customFields.ActivationGroups.value![0],
				currentValue! + 1,
			);
		}
	}

	public isPressed(): boolean {
		return this.thingsStanding.length > 0;
	}

	public override handleBehaviour(level: Level) {
		let isInitial = this.currentIndex == -1;

		if (this.newList.length > 0 && this.thingsStanding.length == 0) {
			const oldGroup =
				this.currentIndex == -1
					? undefined
					: this.customFields.ActivationGroups.value![this.currentIndex];

			this.currentIndex++;
			this.currentIndex %= this.customFields.ActivationGroups.value!.length;

			const newGroup = this.customFields.ActivationGroups.value![this.currentIndex];

			const oldCount = oldGroup ? level.activationStates.get(oldGroup) : undefined;
			const newCount = level.activationStates.get(newGroup)!;

			if (!isInitial) {
				level.activationStates.set(oldGroup!, oldCount! - 1);
			}
			level.activationStates.set(newGroup, newCount + 1);
		} else if (this.newList.length == 0 && this.thingsStanding.length > 0) {
		}

		this.thingsStanding = this.newList;
		this.newList = [];
	}

	public override getData(): ServerButtonData {
		return {
			type: this.type,
			pos: this.pos,
			visualSize: this.size,
			isPressed: this.isPressed(),
		};
	}

	protected override onUpTouching(other: Entity) {
		super.onUpTouching(other);
		this.newList.push(other);
	}

	protected override onUpCollision(overlap: number, other: Entity) {
		super.onUpCollision(overlap, other); // Default behaviour
		this.newList.push(other);
	}

	public clone() {
		return new SwitchButton({ ...this.pos }, { ...this.size }, { ...this.customFields });
	}
}
