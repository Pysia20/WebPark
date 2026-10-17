import { EntityCustomFieldsData, EntityType } from "@shared/commonLevelModels";
import { JohnEntity } from "./JohnEntity";
import { Vector2 } from "@shared/commonModels";
import { LOG } from "../../Logger";
import { Level } from "../Level";
import { MAP_LOADER } from "../LevelLoader";
import { Player } from "../Player";
import { isColliding } from "../../Global";

export class Door extends JohnEntity {
	public override type: EntityType = "Door";

	public playersInside: Player[] = [];

	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields);
		this.customFields = this.validateCustomFields(customFields);
	}

	public override handleCollisions(
		p: Player,
		playerNewPos: Vector2,
		playerNewVel: Vector2,
		isGrounded: boolean,
	): boolean {
		const { overlapX, overlapY, diffX, diffY } = isColliding(this, p);

		if (overlapX != -1 || overlapY != -1) {
			this.playersInside.push(p);
			p.isInsideDoor = true;
		}

		return false;
	}

	public enterDoor(nextLevelID: string) {
		// TODO: Switch level
		// LOG.info(nextLevelID);
	}

	public override clone(): Door {
		return new Door({ ...this.pos }, { ...this.size }, { ...this.customFields });
	}
	public override handleBehaviour(l: Level) {
		if (this.playersInside.length == l.room.getPlayers().size) {
			const level: Level | undefined = MAP_LOADER.GetNextLevel(l.room);

			l.room.changeLevel(level);
		}
	}
}
