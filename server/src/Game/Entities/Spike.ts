import { Vector2 } from "@shared/commonModels";
import { Level } from "../Level";
import { EntityCustomFieldsData } from "@shared/commonLevelModels";
import { RequiredField } from "../../Global";
import { Entity } from "../Entity";

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

	public override onAnyCollision(other: Entity) {
		this.shouldKill = true;
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
