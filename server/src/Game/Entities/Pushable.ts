import { ServerEntityData, Vector2 } from "@shared/commonModels";
import { Level } from "../Level";
import { JohnEntity } from "./JohnEntity";
import { EntityCustomFieldsData, EntityType } from "@shared/commonLevelModels";
import { PLAYER_CONFIG, PUSHABLE_CONFIG } from "@shared/commonVariables";
import { clamp, RequiredField } from "../../Global";
import { Player } from "../Player";
import CONFIG from "../../../config.json";
import { Entity } from "../Entity";

//TODO Add colision with other entities

export class Pushable extends Entity {
	public override getUsedFields() {
		return [
			{
				name: "Mass",
				value: this.customFields.Mass.value,
				isRequired: true,
				isMissing: (v) => !v || v <= 0,
			} as RequiredField,
		];
	}

	private originalPosition: Vector2;
	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields, "Pushable");
		this.originalPosition = { ...pos };

		this.isDynamic = true;
	}

	protected override onRightCollision(overlap: number, other: Entity) {
		//TODO
		// if (other instanceof Player) {
		// 	const playersPushing = other.getPlayersBehind(-1, [...this.level!.room.players.values()]);
		// 	let playersCount = 1 + playersPushing.length; // This + others
		// 	console.log(playersCount);
		// }
	}

	protected override onLeftCollision(overlap: number, other: Entity) {}

	protected override onUpCollision(overlap: number, other: Entity) {}

	protected override onDownCollision(overlap: number, other: Entity) {}

	public override handleBehaviour(l: Level) {
		if (this.velocity.x > PLAYER_CONFIG.DRAG) {
			this.velocity.x -= PLAYER_CONFIG.DRAG;
		} else if (this.velocity.x < -PLAYER_CONFIG.DRAG) {
			this.velocity.x += PLAYER_CONFIG.DRAG;
		} else {
			this.velocity.x = 0;
		}

		if (!this.isGrounded) {
			this.velocity.y += PLAYER_CONFIG.GRAVITY;
		}

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

	public override getData() {
		return {
			pos: this.pos,
			visualSize: this.size,
			type: this.type,
		} as ServerEntityData;
	}

	public override clone() {
		return new Pushable({ ...this.originalPosition }, { ...this.size }, { ...this.customFields });
	}
}
