import { ServerEntityData, Vector2 } from "@shared/commonModels";
import { Level } from "../Level";
import { EntityCustomFieldsData } from "@shared/commonLevelModels";
import { PLAYER_CONFIG, PUSHABLE_CONFIG } from "@shared/commonVariables";
import { clamp, RequiredField } from "../../Global";
import CONFIG from "../../../config.json";
import { Entity } from "../Entity";
import { Player } from "../Player";

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
		// console.log("RIght");
		if (other instanceof Player) {
			const len = other.getPlayersBehind(1, [...this.level!.room.players.values()]).length;

			this.isDynamic = len >= this.customFields.Mass.value!;
			if (!this.isDynamic) {
				super.onRightCollision(overlap, other);
			}
		}
	}

	protected override onLeftCollision(overlap: number, other: Entity) {
		// console.log("LEft");

		if (other instanceof Player) {
			const len = other.getPlayersBehind(-1, [...this.level!.room.players.values()]).length;

			this.isDynamic = len >= this.customFields.Mass.value!;

			// console.log(len);
			if (!this.isDynamic) {
				super.onLeftCollision(overlap, other);
			}
		}
	}

	protected override onUpCollision(overlap: number, other: Entity) {
		if (!this.isDynamic && other instanceof Player) super.onUpCollision(overlap, other);
	}

	protected override onDownCollision(overlap: number, other: Entity) {
		if (!this.isDynamic && other instanceof Player) super.onDownCollision(overlap, other);
	}

	public override calculateVelocities() {
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

		this.velocity.y = clamp(
			this.velocity.y,
			-PUSHABLE_CONFIG.MAX_VERTICAL_SPEED,
			PUSHABLE_CONFIG.MAX_VERTICAL_SPEED,
		);

		this.velocity.x = clamp(
			this.velocity.x,
			-PUSHABLE_CONFIG.MAX_HORIZONTAL_SPEED,
			PUSHABLE_CONFIG.MAX_HORIZONTAL_SPEED,
		);

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
		return new Pushable(
			{ ...this.originalPosition },
			{ ...this.size },
			{ ...this.customFields },
		);
	}
}
