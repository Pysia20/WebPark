import { Vector2 } from "@shared/commonModels";
import { Level } from "../Level";
import { EntityCustomFieldsData, EntityType } from "@shared/commonLevelModels";
import { Player } from "../Player";
import { CollisionOutput, Entity } from "../Entity";

//! DO NOT IMPORT!!!
//? IT IS A TEMPLATE FOR CREATING NEW ENTITY TYPES
//? IT IS NOT USED ANYWARE IN THE CODEBASE
//TODO Change this name and clone()
//TODO Add the name to the EntityType in commonModels
//TODO Add to the TYPE_MAP in the EntityBuilder

export class PlayerSpawner extends Entity {
	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields, "PlayerSpawner");
	}

	protected onRightCollision(overlap: Vector2, other: Entity) {}

	protected onLeftCollision(overlap: Vector2, other: Entity) {}

	protected onUpCollision(overlap: Vector2, other: Entity) {}

	protected onDownCollision(overlap: Vector2, other: Entity) {}

	protected onUpTouching(other: Entity): void {}

	public override clone() {
		return new PlayerSpawner({ ...this.pos }, { ...this.size }, { ...this.customFields });
	}
}
