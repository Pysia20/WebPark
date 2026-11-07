import { Vector2 } from "@shared/commonModels";
import { Level } from "../Level";
import { EntityCustomFieldsData } from "@shared/commonLevelModels";
import { RequiredField } from "../../Global";
import { Entity } from "../Entity";
import { SPIKE_MARGIN } from "@shared/commonVariables";

export class Spike extends Entity {
	public shouldKill: boolean = false;

	public override getUsedFields(): RequiredField[] {
		return [
			{
				name: "OnlyKillThePlayer",
				value: this.customFields.OnlyKillThePlayer.value,
				isMissing: (v: any) => v === undefined,
				isRequired: true,
			},
		] as const;
	}

	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields, "Spike");
	}

	// public override onAnyCollision(other: Entity) {
	// 	if (other.type == "Player") {
	// 		this.shouldKill = true;
	// 	}
	// }

	public override onLeftCollision(overlap: number, other: Entity) {
		super.onLeftCollision(overlap, other);
		if (other.type == "Player") this.level!.shouldRestart = true;
	}

	public override onRightCollision(overlap: number, other: Entity) {
		super.onRightCollision(overlap, other);
		if (other.type == "Player") this.level!.shouldRestart = true;
	}

	public override onUpTouching(other: Entity) {
		if (other.type != "Player") return;

		const x = Math.min(
			Math.abs(other.pos.x + other.size.x - this.pos.x),
			Math.abs(this.pos.x + this.size.x - other.pos.x),
		);

		console.log(x);

		if (x > SPIKE_MARGIN) {
			this.shouldKill = true;
		}
	}

	public override handleBehaviour(l: Level) {
		if (this.shouldKill) {
			this.shouldKill = false;
			l.shouldRestart = true;
		}
	}

	public override clone() {
		return new Spike({ ...this.pos }, { ...this.size }, { ...this.customFields });
	}
}
