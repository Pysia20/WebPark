import { Vector2 } from "@shared/commonModels";
import { Player } from "../Player";
import { JohnEntity } from "./JohnEntity";
import { isColliding, RequiredField } from "../../Global";
import { EntityCustomFieldsData, EntityType } from "@shared/commonLevelModels";
import { PLAYER_CONFIG } from "@shared/commonVariables";
import { Level } from "../Level";
import { LOG } from "../../Logger";
import { ServerButtonData } from "@shared/commonEntityData";
import { MapCollider } from "./MapCollider";
import { CollisionOutput, Entity } from "../Entity";

export class Button extends Entity {
	public thingsStanding: Entity[] = [];
	public newList: Entity[] = [];
	public hasChanged: boolean = false;

	public override getUsedFields(): RequiredField[] {
		return [
			{
				name: "ActivationGroup",
				value: this.customFields.ActivationGroup.value,
				isMissing: (v: any) => v === "" || v === undefined || !v,
				isRequired: true,
			},
		];
	}

	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields, "Button");
	}

	public isPressed(): boolean {
		return this.thingsStanding.length > 0;
	}

	public override endTick() {}

	public override handleBehaviour(level: Level) {
		if (!this.customFields.ActivationGroup.doesExist) return;

		const prevCount = level.activationStates.get(this.customFields.ActivationGroup.value!)!;

		if (this.newList.length > 0 && this.thingsStanding.length == 0) {
			level.activationStates.set(this.customFields.ActivationGroup.value!, prevCount + 1);
		} else if (this.newList.length == 0 && this.thingsStanding.length > 0) {
			level.activationStates.set(this.customFields.ActivationGroup.value!, prevCount - 1);
		}

		this.thingsStanding = this.newList;
		this.newList = [];
	}

	public override getData(): ServerButtonData {
		return {
			type: this.type,
			pos: this.pos,
			visualSize: this.size,
			isPressed: this.isPressed(),
		};
	}

	public entityStanding(entity: Entity) {
		this.newList.push(entity);
	}

	protected override onUpTouching(other: Entity) {
		this.entityStanding(other);
	}

	protected override onUpCollision(output: CollisionOutput, overlap: Vector2, other: Entity) {
		super.onUpCollision(output, overlap, other); // Default behaviour
		this.entityStanding(other);
	}

	public override clone(): Button {
		return new Button({ ...this.pos }, { ...this.size }, { ...this.customFields });
	}
}
