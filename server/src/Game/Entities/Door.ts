import { EntityCustomFieldsData, EntityType } from "@shared/commonLevelModels";
import { Entity } from "./Entity";
import { Vector2 } from "@shared/commonModels";
import { LOG } from "../../Logger";
import { Level } from "../Level";
import { MAP_LOADER } from "../LevelLoader";

export class Door extends Entity {
	public override type: EntityType = "Door";

	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields);
	}

	public override handleCollisions(): boolean {
		return false;
	}

	public enterDoor(nextLevelID: string) {
		// TODO: Switch level
		// LOG.info(nextLevelID);
	}

	public override clone(): Door {
		return new Door(this.pos, this.size, this.customFields);
	}
	public override handleBehaviour(l: Level) {
		const nextLevelID = MAP_LOADER.GetNextLevel(l.group, l.groupIndex)?.getID();

		if (nextLevelID === undefined) {
			// End of group
			return;
		}

		this.enterDoor(nextLevelID);
	}
}
