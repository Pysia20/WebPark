import { Vector2 } from "@shared/commonModels";

import { RequiredField } from "../../Global";
import { EntityCustomFieldsData, EntityType } from "@shared/commonLevelModels";
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
