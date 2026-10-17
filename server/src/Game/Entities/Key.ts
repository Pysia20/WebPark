import { Vector2 } from "@shared/commonModels";
import { Level } from "../Level";
import { EntityCustomFieldsData, EntityType } from "@shared/commonLevelModels";
import { PLAYER_CONFIG } from "@shared/commonVariables";
import { isColliding } from "../../Global";
import { Player } from "../Player";
import { MapCollider } from "./MapCollider";
import { Entity } from "../Entity";

//! DO NOT IMPORT!!!
//? IT IS A TEMPLATE FOR CREATING NEW ENTITY TYPES
//? IT IS NOT USED ANYWARE IN THE CODEBASE
//TODO Add the name to the EntityType in commonModels
//TODO Implement in entity builder

export class Key extends Entity {
	public override type: EntityType = "Key";
	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields, "Key");
	}

	public override clone() {
		return new Key({ ...this.pos }, { ...this.size }, { ...this.customFields });
	}
}
