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

export class GravityField extends Entity {
	private entitiesInside: Entity[] = [];
	private tempInside: Entity[] = [];

	public override getUsedFields(): RequiredField[] {
		return [
			{
				name: "GravityForce",
				value: this.customFields.GravityForce.value,
				isMissing: (v) => !v && v != 0,
				isRequired: true,
			},
		];
	}

	public override onUpCollision(overlap: number, other: Entity) {}
	public override onDownCollision(overlap: number, other: Entity) {}
	public override onRightCollision(overlap: number, other: Entity) {}
	public override onLeftCollision(overlap: number, other: Entity) {}
	public override onUpTouching(other: Entity) {}

	public override onAnyCollision(other: Entity) {
		this.tempInside.push(other);
		if (!this.entitiesInside.includes(other)) {
			other.gravityModifier = this.customFields.GravityForce.value!;
		}
	}

	public override endTick() {
		super.endTick();

		this.entitiesInside.forEach((e) => {
			if (!this.tempInside.includes(e)) {
				e.gravityModifier = 1;
			}
		});

		this.entitiesInside = this.tempInside;
		this.tempInside = [];
	}

	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields, "GravityField");
	}

	public clone() {
		return new GravityField({ ...this.pos }, { ...this.size }, { ...this.customFields });
	}
}
