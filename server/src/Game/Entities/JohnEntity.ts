import { ServerEntityData, Vector2 } from "@shared/commonModels";
import { Player } from "../Player";
import { PLAYER_CONFIG } from "@shared/commonVariables";
import { isColliding, RequiredField } from "../../Global";
import { LOG } from "../../Logger";
import { EntityCustomFieldsData, EntityType } from "@shared/commonLevelModels";
import { EntityBuilder } from "./EntityBuilder";
import { Level } from "../Level";
import { MapCollider } from "./MapCollider";
import { Entity } from "../Entity";

export class JohnEntity extends Entity {
	public readonly type: EntityType = "JohnEntity";

	public readonly usedFields: RequiredField[] = [];

	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields, "JohnEntity");
	}

	public clone(): JohnEntity {
		return new JohnEntity({ ...this.pos }, { ...this.size }, { ...this.customFields });
	}
}
