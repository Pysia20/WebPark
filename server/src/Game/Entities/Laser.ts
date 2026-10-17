import { Vector2 } from "@shared/commonModels";
import { Level } from "../Level";
import { JohnEntity } from "./JohnEntity";
import { EntityCustomFieldsData, EntityType } from "@shared/commonLevelModels";
import { PLAYER_CONFIG } from "@shared/commonVariables";
import { isColliding, RequiredField } from "../../Global";
import { Player } from "../Player";
import e from "cors";

//! DO NOT IMPORT!!!
//? IT IS A TEMPLATE FOR CREATING NEW ENTITY TYPES
//? IT IS NOT USED ANYWARE IN THE CODEBASE
//TODO Change this name and clone()
//TODO Add the name to the EntityType in commonModels
//TODO Add to the TYPE_MAP in the EntityBuilder

export class Laser extends JohnEntity {
	public override type: EntityType = "Laser";

	public readonly usedFields: RequiredField[] = [
		{
			name: "ActivationGroup",
			value: this.customFields.ActivationGroup.value,
			isMissing: (v: any) => v === "" || v === undefined || !v,
			isRequired: true,
		},
		{
			name: "ActivationCount",
			value: this.customFields.ActivationCount.value,
			isMissing: (v: any) => v === 0 || v === undefined || !v,
			isRequired: true,
		},
		{
			name: "StaysOn",
			value: this.customFields.StaysOn.value,
			isMissing: (v: any) => v === undefined,
			isRequired: true,
		},
		{
			name: "OnlyKillThePlayer",
			value: this.customFields.OnlyKillThePlayer.value,
			isMissing: (v: any) => v === undefined,
			isRequired: true,
		},
	] as const;

	private shouldKill: boolean = false;
	private isActivated: boolean = true;

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
		const { overlapX, overlapY, diffX, diffY } = isColliding(p, this);

		if (overlapX != -1 || overlapY != -1) {
			this.shouldKill = true;
		}

		return false;
	}

	public override handleBehaviour(l: Level) {
		if (
			l.activationStates.get(this.customFields.ActivationGroup.value!)! >=
			this.customFields.ActivationCount.value!
		) {
			this.isActivated = false;
		} else if (!this.customFields.StaysOn.value!) {
			this.isActivated = true;
		}

		if (this.isActivated && this.shouldKill) {
			this.shouldKill = false;
			l.shouldRestart = true;
		}
	}
	public override endTick() {}

	public override clone() {
		return new Laser({ ...this.pos }, { ...this.size }, { ...this.customFields });
	}

	// public override getData(){}
}
