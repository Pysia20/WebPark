import { Vector2 } from "@shared/commonModels";
import { Entity } from "../Entity";
import { CustomField, EntityCustomFieldsData } from "@shared/commonLevelModels";
import { RequiredField } from "../../Global";

export class Portal extends Entity {
	public override getUsedFields(): RequiredField[] {
		return [
			{
				name: "PortalGroup",
				value: this.customFields.PortalGroup.value,
				isMissing: (v) => v === "" || !v,
				isRequired: true,
			},
			{
				name: "ActivationGroup",
				value: this.customFields.ActivationGroup.value,
				isMissing: (v) => !v || v === "",
				isRequired: false,
			},
			{
				name: "ActivationCount",
				value: this.customFields.ActivationCount.value,
				isMissing: (v) => !v || v <= 0,
				isRequired: false,
			},
			{
				name: "StaysOn",
				value: this.customFields.StaysOn.value,
				isMissing: (v) => v == null, // Undefined or null,
				isRequired: false,
			},
		];
	}

	public inPortal: Entity[] = [];
	public touchingThisTick: Entity[] = [];

	private activationGroup: CustomField<string>;
	private activationCount: CustomField<number>;
	private staysOn: CustomField<boolean>;
	private isActive: boolean = true;

	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields, "Portal");
		this.isPassable = true;

		this.activationGroup = this.customFields.ActivationGroup;
		this.activationCount = this.customFields.ActivationCount;
		this.staysOn = this.customFields.StaysOn;
	}

	public override init() {
		if (this.activationCount.doesExist && this.activationGroup.doesExist) {
			this.isActive =
				this.level?.activationStates.get(this.activationGroup.value!)! >=
				this.activationCount.value!;
		}
	}

	protected override onRightCollision(overlap: number, other: Entity) {}

	protected override onLeftCollision(overlap: number, other: Entity) {}

	protected override onUpCollision(overlap: number, other: Entity) {}

	protected override onDownCollision(overlap: number, other: Entity) {}

	protected override onUpTouching(other: Entity) {}

	public handleBehaviour() {
		if (this.activationCount.doesExist && this.activationGroup.doesExist) {
			if (this.staysOn.value && this.isActive) {
				return;
			}

			this.isActive =
				this.level?.activationStates.get(this.activationGroup.value!)! >=
				this.activationCount.value!;
		}
	}

	public override onAnyCollision(other: Entity) {
		if (!this.isActive) {
			return;
		}

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
