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
			console.log(this.customFields.ActivationGroup);
			console.log(this.customFields.ActivationCount);
			return;
		}

		if (
			this.customFields.ActivationCount.value! <=
			l.activationStates.get(this.customFields.ActivationGroup.value!)!
		) {
			this.isPassable = false;
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

	protected override onRightCollision(overlap: Vector2, other: Entity) {
		// if (!this.isPassable) {
		return super.onRightCollision(overlap, other);
		// }
		// return undefined;
	}

	protected override onLeftCollision(overlap: Vector2, other: Entity) {
		// if (!this.isPassable) {
		return super.onLeftCollision(overlap, other);
		// }
		// return undefined;
	}

	protected override onUpCollision(overlap: Vector2, other: Entity) {
		// if (!this.isPassable) {
		return super.onUpCollision(overlap, other);
		// }
		// return undefined;
	}

	protected override onDownCollision(overlap: Vector2, other: Entity) {
		// if (!this.isPassable) {
		return super.onDownCollision(overlap, other);
		// }
		// return undefined;
	}
}
