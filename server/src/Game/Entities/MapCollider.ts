import { Vector2 } from "@shared/commonModels";
import { Entity } from "../Entity";
import { EntityCustomFieldsData } from "@shared/commonLevelModels";

export class MapCollider extends Entity {
	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields, "MapCollider");
	}

	public override onAnyCollision(other: Entity) {
		other.onAnyCollision(this);
	}

	public override clone() {
		return new MapCollider(
			{ ...this.pos },
			{ ...this.size },
			{
				...this.customFields,
			},
		);
	}
}
