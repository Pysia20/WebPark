import { Vector2 } from "@shared/commonModels";
import { Level } from "../Level";
import { JohnEntity } from "./JohnEntity";
import { EntityCustomFieldsData, EntityType } from "@shared/commonLevelModels";
import { PLAYER_CONFIG, PUSHABLE_CONFIG } from "@shared/commonVariables";
import { isColliding } from "../../Global";
import { Player } from "../Player";
import CONFIG from "../../../config.json";
import { MapCollider } from "./MapCollider";
import { Entity } from "../Entity";

//TODO Add colision with other entities

export class Pushable extends Entity {
	public pusher: Player | undefined;
	public pusherNewPos: Vector2 | undefined;

	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields, "Pushable");
	}

	// TODO: Needs to be re-done

	public override handleBehaviour(l: Level) {
		let newPos: Vector2 = { x: this.pos.x, y: this.pos.y };
		this.isGrounded = false;

		this.applyPhysics(newPos);

		this.pos = { ...newPos };
	}

	private applyPhysics(newPos: Vector2) {
		if (this.velocity.x > PUSHABLE_CONFIG.DRAG) {
			this.velocity.x -= PUSHABLE_CONFIG.DRAG;
		} else if (this.velocity.x < -PUSHABLE_CONFIG.DRAG) {
			this.velocity.x += PUSHABLE_CONFIG.DRAG;
		} else {
			this.velocity.x = 0;
		}

		if (!this.isGrounded) {
			this.velocity.y += PUSHABLE_CONFIG.GRAVITY;
		}

		newPos.x += this.velocity.x * (1 / CONFIG.TICKRATE);
		newPos.y += this.velocity.y * (1 / CONFIG.TICKRATE);

		this.pos = newPos;
	}

	public override endTick() {
		this.isGrounded = false;
		this.pusher = undefined;
		this.pusherNewPos = undefined;
	}

	public override clone() {
		return new Pushable({ ...this.pos }, { ...this.size }, { ...this.customFields });
	}
}
