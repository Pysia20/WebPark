import { Vector2 } from "@shared/commonModels";
import { Entity } from "../Entity";
import { DummyEntityCustomFields, EntityCustomFieldsData } from "@shared/commonLevelModels";
import { RequiredField } from "../../Global";
import { CannonProjectile } from "./CannonProjectile";
import { TimePrecision } from "zod";

export class Cannon extends Entity {
	public override getUsedFields(): RequiredField[] {
		return [
			{
				name: "Direction",
				value: this.customFields.Direction.value,
				isMissing: (v) => !v || v === undefined,
				isRequired: true,
			},
			{
				name: "Speed",
				value: this.customFields.Speed.value,
				isMissing: (v) => !v || v <= 0,
				isRequired: true,
			},
			{
				name: "Cooldown",
				value: this.customFields.Cooldown.value,
				isMissing: (v) => !v || v <= 0,
				isRequired: true,
			},
		];
	}

	private timer: number = 0;

	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields, "Cannon");
	}

	private shoot() {
		const projectileCustomFields: EntityCustomFieldsData = { ...DummyEntityCustomFields };
		projectileCustomFields.Speed = { doesExist: true, value: this.customFields.Speed.value! };
		projectileCustomFields.Direction = {
			doesExist: true,
			value: this.customFields.Direction.value!,
		};
		const projectile = new CannonProjectile(
			{ ...this.pos },
			{ x: 64, y: 64 },
			{ ...projectileCustomFields },
		);

		this.level!.addEntity(projectile);
	}

	protected override onUpCollision(overlap: number, other: Entity) {
		if (!(other instanceof CannonProjectile)) {
			super.onUpCollision(overlap, other);
		}
	}
	protected override onRightCollision(overlap: number, other: Entity) {
		if (!(other instanceof CannonProjectile)) {
			super.onRightCollision(overlap, other);
		}
	}
	protected override onLeftCollision(overlap: number, other: Entity) {
		if (!(other instanceof CannonProjectile)) {
			super.onLeftCollision(overlap, other);
		}
	}
	protected override onDownCollision(overlap: number, other: Entity) {
		if (!(other instanceof CannonProjectile)) {
			super.onDownCollision(overlap, other);
		}
	}

	public handleBehaviour() {
		this.timer++;
		if (this.timer >= this.customFields.Cooldown.value!) {
			this.timer = 0;
			this.shoot();
		}
	}

	public clone() {
		return new Cannon({ ...this.pos }, { ...this.size }, { ...this.customFields });
	}
}
