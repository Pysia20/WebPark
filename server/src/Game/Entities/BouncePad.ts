import { Vector2 } from "@shared/commonModels";
import { Entity } from "../Entity";
import { EntityCustomFieldsData } from "@shared/commonLevelModels";
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
		];
	}

	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields, "BouncePad");
	}

	public override onAnyCollision(other: Entity) {
		other.velocity.y -= this.customFields.BouncePower.value!;
	}

	public clone() {
		return new BouncePad({ ...this.pos }, { ...this.size }, { ...this.customFields });
	}
}
