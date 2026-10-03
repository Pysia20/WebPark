import { EntityType } from "@shared/commonLevelModels";
import { Entity } from "./Entity";
import { Vector2 } from "@shared/commonModels";

export class Door extends Entity {
	public override type: EntityType = "Door";

	constructor(pos: Vector2, size: Vector2) {
		super(pos, size);
	}

	public override handleCollisions(): boolean {
		return false;
	}

	public enterDoor() {
		// TODO: Switch level
	}
}
