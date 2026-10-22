import { Vector2 } from "@shared/commonModels";
import { RequiredField } from "../../Global";
import { EntityCustomFieldsData } from "@shared/commonLevelModels";
import { Level } from "../Level";
import { ServerButtonData } from "@shared/commonEntityData";
import { Entity } from "../Entity";

export class Button extends Entity {
	public thingsStanding: Entity[] = [];
	public newList: Entity[] = [];
	public hasChanged: boolean = false;

	public override getUsedFields(): RequiredField[] {
		return [
			{
				name: "ActivationGroup",
				value: this.customFields.ActivationGroup.value,
				isMissing: (v: any) => v === "" || v === undefined || !v,
				isRequired: true,
			},
		] as const;
	}

	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields, "Button");
	}

	public isPressed(): boolean {
		return this.thingsStanding.length > 0;
	}

	public override handleBehaviour(level: Level) {
		if (!this.customFields.ActivationGroup.doesExist) return;

		const prevCount = level.activationStates.get(this.customFields.ActivationGroup.value!)!;

		if (this.newList.length > 0 && this.thingsStanding.length == 0) {
			level.activationStates.set(this.customFields.ActivationGroup.value!, prevCount + 1);
		} else if (this.newList.length == 0 && this.thingsStanding.length > 0) {
			level.activationStates.set(this.customFields.ActivationGroup.value!, prevCount - 1);
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

	public override clone(): Button {
		return new Button({ ...this.pos }, { ...this.size }, { ...this.customFields });
	}
}
