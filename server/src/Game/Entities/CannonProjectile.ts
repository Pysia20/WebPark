import { Vector2 } from "@shared/commonModels";
import { Entity } from "../Entity";
import { EntityCustomFieldsData, EntityType } from "@shared/commonLevelModels";
import { garbageRegistry, RequiredField } from "../../Global";
import { DESPAWN_BUFFER } from "@shared/commonVariables";
import { LOG } from "../../Logger";
import { Cannon } from "./Cannon";
import { Level } from "../Level";
import CONFIG from "../../../config.json";
import { Ent } from "../../../../client/src/Entities/Ent";
import { Player } from "../Player";

export class CannonProjectile extends Entity {
	public override getUsedFields(): RequiredField[] {
		return [
			{
				name: "Direction",
				value: this.customFields.Direction.value,
				isMissing: (v) => !v || v === undefined,
				isRequired: true,
			},
			{
				name: "Speed",
				value: this.customFields.Speed.value,
				isMissing: (v) => !v || v <= 0,
				isRequired: true,
			},
		];
	}

	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields, "CannonProjectile");
		this.isDynamic = true;

		this.velocity = { x: 0, y: 0 };
	}

	// Types of entities that the projectile can collide and not get destroyed.
	private allowedTypes: EntityType[] = ["Portal", "Player", "PlayerSpawner"];

	public override handleBehaviour(l: Level) {
		if (this.pos.x < -DESPAWN_BUFFER || this.pos.x > this.level?.width! + DESPAWN_BUFFER) {
			LOG.error("IMPLEMENT THIS FUCKING DESPAWNING JOHN");
			this.level?.removeEntity(this);
		}
		if (this.pos.y < -DESPAWN_BUFFER || this.pos.y > this.level?.height! + DESPAWN_BUFFER) {
			LOG.error("IMPLEMENT THIS FUCKING DESPAWNING JOHN");
			this.level?.removeEntity(this);
		}

		const speed = this.customFields.Speed.value!;

		switch (this.customFields.Direction.value) {
			case "Up":
				this.pos.y -= speed;
				break;
			case "Down":
				this.pos.y += speed;
				break;
			case "Left":
				this.pos.x -= speed;
				break;
			case "Right":
				this.pos.x += speed;
				break;
		}
	}

	protected override onUpCollision(overlap: number, other: Entity) {}
	protected override onRightCollision(overlap: number, other: Entity) {}
	protected override onLeftCollision(overlap: number, other: Entity) {}
	protected override onDownCollision(overlap: number, other: Entity) {}
	protected override onUpTouching(other: Entity) {}

	protected override onAnyCollision(other: Entity) {
		if (other instanceof Player) {
			this.level!.shouldRestart = true;
			// console.log(other.type);
		} else if (!this.allowedTypes.includes(other.type)) {
			this.level?.removeEntity(this);
		}
	}

	public clone() {
		return new CannonProjectile({ ...this.pos }, { ...this.size }, { ...this.customFields });
	}
}
