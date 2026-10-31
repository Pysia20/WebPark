import { Vector2 } from "@shared/commonModels";
import { Entity } from "../Entity";
import { EntityCustomFieldsData } from "@shared/commonLevelModels";
import { getDistance, RequiredField } from "../../Global";
import { Player } from "../Player";
import { LOG } from "../../Logger";

//! DO NOT IMPORT!!!
//? IT IS A TEMPLATE FOR CREATING NEW ENTITY TYPES
//? IT IS NOT USED ANYWARE IN THE CODEBASE
//TODO Change this name and clone()
//TODO Add the name to the EntityType in commonModels
//TODO Add to the TYPE_MAP in the EntityBuilder

export class WeepingAngel extends Entity {
	private target: Player | null = null;
	private readonly speed: number;
	public isWatched: boolean = false;

	public override getUsedFields(): RequiredField[] {
		return [
			{
				name: "Speed",
				value: this.customFields.Speed,
				isMissing: (v) => !v || v <= 0,
				isRequired: true,
			},
		];
	}

	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields, "WeepingAngel");

		this.speed = customFields.Speed.value!;
	}

	protected override onRightCollision(overlap: number, other: Entity) {}

	protected override onLeftCollision(overlap: number, other: Entity) {}

	protected override onUpCollision(overlap: number, other: Entity) {}

	protected override onDownCollision(overlap: number, other: Entity) {}

	protected override onUpTouching(other: Entity) {}

	private isCursorOver(cursorPos: Vector2) {
		const overX = this.pos.x <= cursorPos.x && cursorPos.x <= this.pos.x + this.size.x;
		const overY = this.pos.y <= cursorPos.y && cursorPos.y <= this.pos.y + this.size.y;

		return overX && overY;
	}

	public handleBehaviour() {
		this.isWatched = false;

		const players = [...this.level!.room.players.values()];

		let closestDistance = Infinity;
		let closestPlayer: Player | null = this.target;

		players.forEach((p) => {
			const distance = getDistance(p.pos, this.pos);

			if (closestDistance > distance) {
				closestDistance = distance;
				closestPlayer = p;
			}

			if (this.isCursorOver(p.currentInputs.cursorPos)) {
				this.isWatched = true;
			}
		});

		if (!closestPlayer) {
			LOG.warn(`No players in room ${this.level!.room.getID()}`);
			return;
		}
		this.target = closestPlayer;

		if (this.isWatched) return;

		const v: Vector2 = { x: this.target.pos.x - this.pos.x, y: this.target.pos.y - this.pos.y };
		const magnitude = Math.sqrt(v.x ** 2 + v.y ** 2);
		const normalizedV: Vector2 = { x: v.x / magnitude, y: v.y / magnitude };

		const movementVector: Vector2 = {
			x: normalizedV.x * this.speed,
			y: normalizedV.y * this.speed,
		};

		this.pos.x += movementVector.x;
		this.pos.y += movementVector.y;
	}

	public clone() {
		return new WeepingAngel({ ...this.pos }, { ...this.size }, { ...this.customFields });
	}
}
