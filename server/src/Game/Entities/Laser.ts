import { Vector2 } from "@shared/commonModels";
import { Level } from "../Level";
import { JohnEntity } from "./JohnEntity";
import { EntityCustomFieldsData, EntityType } from "@shared/commonLevelModels";
import { PLAYER_CONFIG } from "@shared/commonVariables";
import { RequiredField } from "../../Global";
import { Player } from "../Player";
import e from "cors";
import { Entity } from "../Entity";
import { ServerButtonDoorData, ServerLaserEntityData } from "@shared/commonEntityData";

//! DO NOT IMPORT!!!
//? IT IS A TEMPLATE FOR CREATING NEW ENTITY TYPES
//? IT IS NOT USED ANYWARE IN THE CODEBASE
//TODO Change this name and clone()
//TODO Add the name to the EntityType in commonModels
//TODO Add to the TYPE_MAP in the EntityBuilder

export class Laser extends Entity {
	public override getUsedFields(): RequiredField[] {
		return [
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
	}

	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields, "Laser");
	}

	private shouldKill: boolean = false;
	private isActivated: boolean = true;

	public override onAnyCollision() {
		this.shouldKill = true;
	}

	protected override onRightCollision(overlap: number, other: Entity) {}

	protected override onLeftCollision(overlap: number, other: Entity) {}

	protected override onUpCollision(overlap: number, other: Entity) {}

	protected override onDownCollision(overlap: number, other: Entity) {}

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

		this.shouldKill = false;
	}

	public override clone() {
		return new Laser({ ...this.pos }, { ...this.size }, { ...this.customFields });
	}

	public override getData(): ServerLaserEntityData {
		return {
			pos: this.pos,
			visualSize: this.size,
			type: this.type,
			isActive: this.isActivated,
		};
	}
}
