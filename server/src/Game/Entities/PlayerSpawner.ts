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

	protected override onRightCollision(
		output: CollisionOutput,
		overlap: Vector2,
		other: Entity,
	): void {}

	protected override onLeftCollision(
		output: CollisionOutput,
		overlap: Vector2,
		other: Entity,
	): void {}

	protected override onDownCollision(
		output: CollisionOutput,
		overlap: Vector2,
		other: Entity,
	): void {}

	protected override onUpCollision(
		output: CollisionOutput,
		overlap: Vector2,
		other: Entity,
	): void {}

	protected override onAnyCollision(other: Entity) {}

	public override clone() {
		return new PlayerSpawner({ ...this.pos }, { ...this.size }, { ...this.customFields });
	}
}
