import { EntityCustomFieldsData, EntityType } from "@shared/commonLevelModels";
import { Vector2 } from "@shared/commonModels";
import { LOG } from "../../Logger";
import { Level } from "../Level";
import { ServerButtonDoorData } from "@shared/commonEntityData";
import { CollisionOutput, Entity } from "../Entity";
import { RequiredField } from "../../Global";

export class ButtonDoor extends Entity {
	public isPassable: boolean = false;

	public override getUsedFields(): RequiredField[] {
		return [
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
		] as const;
	}

	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields, "ButtonDoor");
	}

	public override clone() {
		return new ButtonDoor({ ...this.pos }, { ...this.size }, { ...this.customFields });
	}

	public override handleBehaviour(l: Level) {
		if (
			!this.customFields.ActivationCount.doesExist ||
			!this.customFields.ActivationGroup.doesExist
		) {
			return;
		}

		if (
			this.customFields.ActivationCount.value! <=
			l.activationStates.get(this.customFields.ActivationGroup.value!)!
		) {
			this.isPassable = true;
		} else {
			if (!this.customFields.StaysOn.value) {
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

	protected override onRightCollision(overlap: Vector2, other: Entity) {
		if (!this.isPassable) {
			super.onRightCollision(overlap, other);
		}
	}

	protected override onLeftCollision(overlap: Vector2, other: Entity) {
		if (!this.isPassable) {
			super.onLeftCollision(overlap, other);
		}
	}

	protected override onUpCollision(overlap: Vector2, other: Entity) {
		if (!this.isPassable) {
			super.onUpCollision(overlap, other);
		}
	}

	protected override onDownCollision(overlap: Vector2, other: Entity) {
		if (!this.isPassable) {
			super.onDownCollision(overlap, other);
		}
	}
}
