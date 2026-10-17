import { Vector2 } from "@shared/commonModels";
import { Level } from "../Level";
import { JohnEntity } from "./JohnEntity";
import { EntityCustomFieldsData, EntityType } from "@shared/commonLevelModels";
import { PLAYER_CONFIG } from "@shared/commonVariables";
import { isColliding, RequiredField } from "../../Global";
import { Player } from "../Player";
import { LOG } from "../../Logger";
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

	protected override onAnyCollision(other: Entity) {
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
