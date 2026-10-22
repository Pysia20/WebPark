import { Vector2 } from "@shared/commonModels";
import { Level } from "../Level";
import { JohnEntity } from "./JohnEntity";
import { EntityCustomFieldsData, EntityType } from "@shared/commonLevelModels";
import { PLAYER_CONFIG, PUSHABLE_CONFIG } from "@shared/commonVariables";
import { clamp, isColliding } from "../../Global";
import { Player } from "../Player";
import CONFIG from "../../../config.json";
import { MapCollider } from "./MapCollider";
import { Entity } from "../Entity";

//TODO Add colision with other entities

export class Pushable extends Entity {
	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields, "Pushable");

		this.isDynamic = true;
	}

	protected override onRightCollision(overlap: Vector2, other: Entity) {
		// super.onRightCollision(overlap, other);
	}

	protected override onLeftCollision(overlap: Vector2, other: Entity) {
		// super.onLeftCollision(overlap, other);
	}

	protected override onUpCollision(overlap: Vector2, other: Entity) {
		// super.onUpCollision(overlap, other);
	}

	protected override onDownCollision(overlap: Vector2, other: Entity) {
		// super.onDownCollision(overlap, other);
	}

	public override handleBehaviour(l: Level) {
		if (this.velocity.x > PLAYER_CONFIG.DRAG) {
			this.velocity.x -= PLAYER_CONFIG.DRAG;
		} else if (this.velocity.x < -PLAYER_CONFIG.DRAG) {
			this.velocity.x += PLAYER_CONFIG.DRAG;
		} else {
			this.velocity.x = 0;
		}

		// if (!this.isGrounded) {
		// 	this.velocity.y += PLAYER_CONFIG.GRAVITY;
		// }

		this.velocity.y = clamp(
			this.velocity.y,
			-PLAYER_CONFIG.MAX_VERTICAL_SPEED,
			PLAYER_CONFIG.MAX_VERTICAL_SPEED,
		);

		this.velocity.x = clamp(
			this.velocity.x,
			-PLAYER_CONFIG.MAX_HORIZONTAL_SPEED,
			PLAYER_CONFIG.MAX_HORIZONTAL_SPEED,
		);

		this.pos.x += this.velocity.x * (1 / CONFIG.TICKRATE);
		this.pos.y += this.velocity.y * (1 / CONFIG.TICKRATE);

		this.isGrounded = false;
	}
	public override clone() {
		return new Pushable({ ...this.pos }, { ...this.size }, { ...this.customFields });
	}
}
