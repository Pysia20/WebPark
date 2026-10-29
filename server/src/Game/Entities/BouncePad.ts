import { Vector2 } from "@shared/commonModels";
import { Entity } from "../Entity";
import { CustomField, EntityCustomFieldsData } from "@shared/commonLevelModels";
import { RequiredField } from "../../Global";

//! DO NOT IMPORT!!!
//? IT IS A TEMPLATE FOR CREATING NEW ENTITY TYPES
//? IT IS NOT USED ANYWARE IN THE CODEBASE
//TODO Change this name and clone()
//TODO Add the name to the EntityType in commonModels
//TODO Add to the TYPE_MAP in the EntityBuilder

export class BouncePad extends Entity {
	public override getUsedFields(): RequiredField[] {
		return [
			{
				name: "BouncePower",
				value: this.customFields.BouncePower.value,
				isMissing: (v) => !v || v <= 0,
				isRequired: true,
			},
			{
				name: "ActivationGroup",
				value: this.customFields.ActivationGroup.value,
				isMissing: (v) => !v || v == "",
				isRequired: false,
			},
			{
				name: "ActivationCount",
				value: this.customFields.ActivationCount.value,
				isMissing: (v) => !v || v <= 0,
				isRequired: false,
			},
			{
				name: "StaysOn",
				value: this.customFields.StaysOn.value,
				isMissing: (v) => v == null,
				isRequired: false,
			},
		];
	}

	private activationGroup: CustomField<string>;
	private activationCount: CustomField<number>;
	private staysOn: CustomField<boolean>;
	public isActive: boolean = false;

	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields, "BouncePad");

		this.activationGroup = this.customFields.ActivationGroup;
		this.activationCount = this.customFields.ActivationCount;
		this.staysOn = this.customFields.StaysOn;
	}

	public override handleBehaviour() {
		if (this.activationGroup.doesExist && this.activationCount.doesExist) {
			const currentState =
				this.level?.activationStates.get(this.activationGroup.value!)! >=
				this.activationCount.value!;

			if (currentState) {
				this.isActive = true;
			} else if (!this.staysOn.value) {
				this.isActive = false;
			}
		}
	}

	public override onAnyCollision(other: Entity) {
		if (this.isActive) {
			other.velocity.y -= this.customFields.BouncePower.value!;
		}
	}

	public clone() {
		return new BouncePad({ ...this.pos }, { ...this.size }, { ...this.customFields });
	}
}
