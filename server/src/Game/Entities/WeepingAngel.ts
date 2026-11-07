import { Vector2 } from "@shared/commonModels";
import { Entity } from "../Entity";
import { EntityCustomFieldsData } from "@shared/commonLevelModels";
import { getDistance, RequiredField } from "../../Global";
import { Player } from "../Player";
import { LOG } from "../../Logger";
import {
	PATHFINDING_RESOLUTION,
	PATHFINDING_SCALE,
	PLAYER_CONFIG,
	WORLD_CONFIG,
} from "@shared/commonVariables";

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
				value: this.customFields.Speed.value,
				isMissing: (v) => !v || v <= 0,
				isRequired: true,
			},
		];
	}

	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields, "WeepingAngel");

		this.speed = customFields.Speed.value!;
		this.isPhantom = true;
	}

	private isCursorOver(cursorPos: Vector2) {
		const overX = this.pos.x <= cursorPos.x && cursorPos.x <= this.pos.x + this.size.x;
		const overY = this.pos.y <= cursorPos.y && cursorPos.y <= this.pos.y + this.size.y;

		return overX && overY;
	}

	// protected override onRightCollision(overlap: number, other: Entity) {
	// 	if (other instanceof Player) super.onRightCollision(overlap, other);
	// }

	// protected override onLeftCollision(overlap: number, other: Entity) {
	// 	if (other instanceof Player) super.onLeftCollision(overlap, other);
	// }

	// protected override onUpCollision(overlap: number, other: Entity) {
	// 	if (other instanceof Player) super.onUpCollision(overlap, other);
	// }

	// protected override onDownCollision(overlap: number, other: Entity) {
	// 	if (other instanceof Player) super.onDownCollision(overlap, other);
	// }

	// protected override onUpTouching(other: Entity) {
	// 	if (other instanceof Player) super.onUpTouching(other);
	// }

	public override handleBehaviour() {
		const players = [...this.level!.room.players.values()];
		this.isWatched = false;

		players.forEach((p) => {
			if (this.isCursorOver(p.currentInputs.cursorPos)) {
				this.isWatched = true;
			}
		});
	}

	public override endTick() {
		if (this.isWatched) return;

		const players = [...this.level!.room.players.values()];

		let closestDistance = Infinity;
		let closestPlayer: Player | null = this.target;

		players.forEach((p) => {
			const distance = getDistance(p.pos, this.pos);

			if (closestDistance > distance && !p.isInsideDoor) {
				closestDistance = distance;
				closestPlayer = p;
			}
		});

		if (!closestPlayer) {
			LOG.warn(`No players in room ${this.level!.room.getID()}`);
			return;
		}
		this.target = closestPlayer;

		const thisPos: Vector2 = { ...this.pos };
		thisPos.x = Math.round(thisPos.x / PATHFINDING_RESOLUTION);
		thisPos.y = Math.round(thisPos.y / PATHFINDING_RESOLUTION);

		const otherPos: Vector2 = { ...this.target.pos };
		otherPos.x = Math.floor(otherPos.x / PATHFINDING_RESOLUTION);
		otherPos.y = Math.floor(
			(otherPos.y + (PLAYER_CONFIG.HEIGHT - PATHFINDING_RESOLUTION)) / PATHFINDING_RESOLUTION,
		);

		const path = this.level?.grid.pathFind(
			thisPos,
			otherPos,
			{
				x: this.size.x / PATHFINDING_RESOLUTION + 2,
				y: this.size.y / PATHFINDING_RESOLUTION + 2,
			},
			{
				x: this.target.size.x / PATHFINDING_RESOLUTION,
				y: this.target.size.y / PATHFINDING_RESOLUTION,
			},
		);

		if (!path || path.length <= 1) return;

		const target: Vector2 = {
			x: path![1].x * PATHFINDING_RESOLUTION,
			y: path![1].y * PATHFINDING_RESOLUTION,
		};

		const v: Vector2 = { x: target.x - this.pos.x, y: target.y - this.pos.y };
		const magnitude = Math.sqrt(v.x ** 2 + v.y ** 2);
		const normalizedV: Vector2 = { x: v.x / magnitude, y: v.y / magnitude };

		const movementVector: Vector2 = {
			x: normalizedV.x * this.speed,
			y: normalizedV.y * this.speed,
		};

		this.pos.x += movementVector.x;
		this.pos.y += movementVector.y;
	}

	public override onAnyCollision(other: Entity) {
		if (other instanceof Player && !this.isWatched) {
			this.level!.shouldRestart = true;
		}
	}

	public clone() {
		return new WeepingAngel({ ...this.pos }, { ...this.size }, { ...this.customFields });
	}
}
