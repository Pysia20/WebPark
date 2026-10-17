import { Vector2 } from "@shared/commonModels";
import { Entity } from "../Entity";
import { EntityCustomFieldsData, EntityType } from "@shared/commonLevelModels";

export class MapColliderOld {
	private _forceInstance!: void;
	public x: number = -1;
	public y: number = -1;
	public width: number = -1;
	public height: number = -1;

	constructor(x: number, y: number, width: number, height: number) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
}

export class MapCollider extends Entity {
	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields, "MapCollider");
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
