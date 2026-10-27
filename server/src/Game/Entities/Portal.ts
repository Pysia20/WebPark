import { Vector2 } from "@shared/commonModels";
import { Entity } from "../Entity";
import { EntityCustomFieldsData } from "@shared/commonLevelModels";
import { RequiredField } from "../../Global";
import { Player } from "../Player";
import { PLAYER_CONFIG } from "@shared/commonVariables";

export class Portal extends Entity {
	public override getUsedFields(): RequiredField[] {
		return [
			{
				name: "PortalGroup",
				value: this.customFields.PortalGroup.value,
				isMissing: (v) => v === "" || !v,
				isRequired: true,
			},
		];
	}

	public inPortal: Entity[] = [];
	public touchingThisTick: Entity[] = [];

	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields, "Portal");
	}

	protected override onRightCollision(overlap: number, other: Entity) {}

	protected override onLeftCollision(overlap: number, other: Entity) {}

	protected override onUpCollision(overlap: number, other: Entity) {}

	protected override onDownCollision(overlap: number, other: Entity) {}

	protected override onUpTouching(other: Entity) {}

	protected override onAnyCollision(other: Entity) {
		this.touchingThisTick.push(other);
		if (this.inPortal.includes(other)) {
			return;
		}

		const tuple = this.level?.portals.get(this.customFields.PortalGroup.value!)!;
		const otherPortal: Portal = tuple[0] == this ? tuple[1]! : tuple[0]!;

		const playerNewPos = { ...otherPortal.pos };
		playerNewPos.y -= Math.abs(other.size.y - this.size.y);
		other.pos = { ...playerNewPos };
		otherPortal.onEntityTeleported(other);
	}

	public onEntityTeleported(e: Entity) {
		this.inPortal.push(e);
		this.touchingThisTick.push(e);
	}

	public override endTick() {
		let temp: Entity[] = [];

		this.touchingThisTick.forEach((e) => {
			if (this.inPortal.includes(e)) {
				temp.push(e);
			}
		});

		this.inPortal = temp;

		this.touchingThisTick = [];
	}

	public clone() {
		return new Portal({ ...this.pos }, { ...this.size }, { ...this.customFields });
	}
}
