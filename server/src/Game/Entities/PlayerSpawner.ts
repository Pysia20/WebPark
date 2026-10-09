import { Vector2 } from "@shared/commonModels";
import { Level } from "../Level";
import { Entity } from "./Entity";
import { EntityCustomFieldsData, EntityType } from "@shared/commonLevelModels";
import { Player } from "../Player";

//! DO NOT IMPORT!!!
//? IT IS A TEMPLATE FOR CREATING NEW ENTITY TYPES
//? IT IS NOT USED ANYWARE IN THE CODEBASE
//TODO Change this name and clone()
//TODO Add the name to the EntityType in commonModels
//TODO Add to the TYPE_MAP in the EntityBuilder

export class PlayerSpawner extends Entity {
	public override type: EntityType = "PlayerSpawner";
	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields);
	}

	public override handleCollisions(
		p: Player,
		playerNewPos: Vector2,
		playerNewVel: Vector2,
		isGrounded: boolean,
	): boolean {
		return false;
	}

	public override handleBehaviour(l: Level) {}
	public override endTick() {}

	public override clone() {
		return new PlayerSpawner({ ...this.pos }, { ...this.size }, { ...this.customFields });
	}
}
