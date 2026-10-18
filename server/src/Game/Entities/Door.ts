import { EntityCustomFieldsData, EntityType } from "@shared/commonLevelModels";
import { Vector2 } from "@shared/commonModels";
import { Level } from "../Level";
import { MAP_LOADER } from "../LevelLoader";
import { Player } from "../Player";
import { CollisionOutput, Entity } from "../Entity";

export class Door extends Entity {
	public playersInside: Player[] = [];

	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields, "Door");
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

	protected override onRightCollision(overlap: Vector2, other: Entity) {
		if (other instanceof Player) {
			this.playersInside.push(other);
			other.isInsideDoor = true;
		}
		return undefined;
	}

	protected override onLeftCollision(overlap: Vector2, other: Entity) {
		if (other instanceof Player) {
			this.playersInside.push(other);
			other.isInsideDoor = true;
		}
		return undefined;
	}

	protected override onUpCollision(overlap: Vector2, other: Entity) {
		if (other instanceof Player) {
			this.playersInside.push(other);
			other.isInsideDoor = true;
		}
		return undefined;
	}

	protected override onDownCollision(overlap: Vector2, other: Entity) {
		if (other instanceof Player) {
			this.playersInside.push(other);
			other.isInsideDoor = true;
		}
		return undefined;
	}
}
