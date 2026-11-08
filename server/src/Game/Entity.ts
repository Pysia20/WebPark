import { EntityCustomFieldsData, EntityType } from "@shared/commonLevelModels";
import { ServerEntityData, Vector2 } from "@shared/commonModels";
import { Level } from "../Game/Level";
import { RequiredField } from "../Global";
import { LOG } from "../Logger";
import {
	COLLISION_MARGIN_X,
	COLLISION_MARGIN_Y,
	CORNER_CORRECTION,
	GROUND_DETECTON_OFFSET,
} from "@shared/commonVariables";
import CONFIG from "../../config.json";
import { Player } from "./Player";
import { PoolConnection } from "mysql2";

export abstract class Entity {
	public id: number = -1;
	public velocity: Vector2 = { x: 0, y: 0 };
	public level: Level | undefined;
	public isGrounded: boolean = false;
	public isDynamic: boolean = false;
	public velocityStack: Vector2[] = [];
	public isPushing: boolean = false;
	public isPassable: boolean = false;
	public isPhantom: boolean = false;
	public isInsideDoor: boolean = false;
	public riders: Entity[] = [];
	public gravityModifier: number = 1;

	public getUsedFields(): RequiredField[] {
		return [];
	}

	constructor(
		public pos: Vector2,
		public size: Vector2,
		public customFields: EntityCustomFieldsData,
		public readonly type: EntityType,
	) {
		this.pos = { ...pos };
		this.size = { ...size };
		this.customFields = this.validateCustomFields(customFields);
	}

	public init() {}

	public setLevel(level: Level) {
		this.level = level;
	}

	public validateCustomFields(customFields: EntityCustomFieldsData): EntityCustomFieldsData {
		let newCustomFields: EntityCustomFieldsData = { ...customFields };

		for (let field of this.getUsedFields()) {
			newCustomFields[field.name].doesExist = true;

			if (field.isMissing(field.value)) {
				newCustomFields[field.name].doesExist = false;
				if (field.isRequired) {
					LOG.error(
						`${this.type} doesn't have an '${field.name}' custom field or it's value is invalid. (${field.value}) (${this.pos.x}, ${this.pos.y})`,
					);
					throw Error(
						`${this.type} doesn't have an '${field.name}' custom field or it's value is invalid. (${field.value}) (${this.pos.x}, ${this.pos.y})`,
					);
				}

				// LOG.warn(
				// 	`${this.type} doesn't have an '${field.name}' custom field or it's value is invalid. (${this.pos.x}, ${this.pos.y})`,
				// );
			}
		}

		return newCustomFields;
	}

	public static isColliding(
		A: Entity | { pos: Vector2; size: Vector2 },
		B: Entity | { pos: Vector2; size: Vector2 },
	): { collidesX: boolean; collidesY: boolean } {
		const { x: xA, y: yA } = A.pos;
		const { x: widthA, y: heightA } = A.size;

		const { x: xB, y: yB } = B.pos;
		const { x: widthB, y: heightB } = B.size;

		const collidesX = xB < xA + widthA && xA < xB + widthB;
		const collidesY = yB < yA + heightA && yA < yB + heightB;

		return { collidesX, collidesY };
	}

	/**
	 * "Other" is the one lowered
	 * Aka if this true then "other" is grounded
	 */
	protected checkGrounded(other: Entity): boolean {
		const xA = this.pos.x;
		const yA = this.pos.y;
		const { x: widthA, y: heightA } = this.size;

		const xB = other.pos.x + COLLISION_MARGIN_X / 2;
		const yB = other.pos.y + COLLISION_MARGIN_Y / 2 + GROUND_DETECTON_OFFSET;
		const widthB = other.size.x - COLLISION_MARGIN_X / 2;
		const heightB = other.size.y - COLLISION_MARGIN_Y / 2;

		const isCollidingX = xB < xA + widthA && xA < xB + widthB;
		const isCollidingY = yB < yA + heightA && yA < yB + heightB;

		return isCollidingX && isCollidingY;
	}

	public static calculateCollisionsX(a: Entity, b: Entity) {
		if (a.isInsideDoor || b.isInsideDoor) return;

		const aPos: Vector2 = { ...a.pos };
		const aSize: Vector2 = { ...a.size };

		const bPos: Vector2 = { ...b.pos };
		const bSize: Vector2 = { ...b.size };

		aPos.y += COLLISION_MARGIN_Y / 2;
		aSize.y -= COLLISION_MARGIN_Y / 2;

		bPos.y += COLLISION_MARGIN_Y / 2;
		bSize.y -= COLLISION_MARGIN_Y / 2;

		const { collidesX, collidesY } = Entity.isColliding(
			{ pos: aPos, size: aSize },
			{ pos: bPos, size: bSize },
		);

		if (!(collidesX && collidesY)) return;

		const centerA = a.pos.x + a.size.x / 2;
		const centerB = b.pos.x + b.size.x / 2;

		const diff = centerA - centerB;
		const overlap = (a.size.x + b.size.x) / 2 - Math.abs(diff);

		if (diff > 0) {
			a.onRightCollision(overlap, b);
			b.onLeftCollision(overlap, a);
		} else {
			a.onLeftCollision(overlap, b);
			b.onRightCollision(overlap, a);
		}

		a.onAnyCollision(b);
		b.onAnyCollision(a);
	}

	public static calculateCollisionsY(a: Entity, b: Entity) {
		if (a.isInsideDoor || b.isInsideDoor) return;

		const aPos: Vector2 = { ...a.pos };
		const aSize: Vector2 = { ...a.size };

		const bPos: Vector2 = { ...b.pos };
		const bSize: Vector2 = { ...b.size };

		aPos.x += COLLISION_MARGIN_X / 2;
		aSize.x -= COLLISION_MARGIN_X / 2;

		bPos.x += COLLISION_MARGIN_X / 2;
		bSize.x -= COLLISION_MARGIN_X / 2;

		const { collidesX, collidesY } = Entity.isColliding(
			{ pos: aPos, size: aSize },
			{ pos: bPos, size: bSize },
		);

		if (collidesX && collidesY) {
			const centerA = a.pos.y + a.size.y / 2;
			const centerB = b.pos.y + b.size.y / 2;

			const diff = centerA - centerB;
			const overlap = (a.size.y + b.size.y) / 2 - Math.abs(diff);

			if (diff > 0) {
				a.onUpCollision(overlap, b);
				if (!a.cornerCorrection(b)) {
					b.onDownCollision(overlap, a);
				}
			} else {
				if (!b.cornerCorrection(a)) {
					a.onDownCollision(overlap, b);
				}
				b.onUpCollision(overlap, a);
			}

			a.onAnyCollision(b);
			b.onAnyCollision(a);
		} else if (b.checkGrounded(a)) b.onUpTouching(a);
		else if (a.checkGrounded(b)) a.onUpTouching(b);
		else {
			let players: Player[] = [];
			if (a instanceof Player) players.push(a);
			if (b instanceof Player) players.push(b);

			players.forEach((p) => {
				p.checkJumpBuffering(a);
				p.checkJumpBuffering(b);
			});
		}
	}

	public setGrounded() {
		this.isGrounded = true;
	}

	public calculateVelocities() {
		this.isPushing = false;
	}

	public moveXAxis(x?: number) {
		const move = x ?? this.velocity.x * (1 / CONFIG.TICKRATE);

		this.pos.x += move;
		this.riders.forEach((r) => {
			r.pos.x += move;
		});
	}

	public moveYAxis(y?: number) {
		const move = y ?? this.velocity.y * (1 / CONFIG.TICKRATE);

		this.pos.y += move;
		this.riders.forEach((r) => {
			r.pos.y += move;
		});
	}

	protected onRightCollision(overlap: number, other: Entity) {
		if (!other.isPhantom) {
			other.pos.x -= overlap;
			other.velocity.x = 0;
		}
	}

	protected onLeftCollision(overlap: number, other: Entity) {
		if (!other.isPhantom) {
			other.pos.x += overlap;
			other.velocity.x = 0;
		}
	}

	protected onUpCollision(overlap: number, other: Entity) {
		if (!other.isPhantom) {
			other.pos.y -= overlap;
			if (other.velocity.y > 0) {
				other.velocity.y = 0;
			}
			other.setGrounded();
			this.addRider(other);
		}
	}

	protected onDownCollision(overlap: number, other: Entity) {
		if (!other.isPhantom) {
			other.pos.y += overlap;
			if (other.velocity.y < 0) {
				other.velocity.y = 0;
			}
		}
	}

	public onAnyCollision(other: Entity) {}

	protected onUpTouching(other: Entity): void {
		if (!other.isPhantom) {
			if (other.velocity.y > 0) {
				other.velocity.y = 0;
			}
			other.setGrounded();
			this.addRider(other);
		}
	}

	private cornerCorrection(other: Entity) {
		if (this.velocity.y < 0) {
			const x = this.pos.x;
			const y = this.pos.y;
			{
				const { collidesX, collidesY } = Entity.isColliding(
					{ pos: { x: x + CORNER_CORRECTION, y: y }, size: this.size },
					other,
				);

				if (!(collidesX && collidesY)) {
					const correction = other.pos.x + other.size.x - x;
					this.pos.x += correction;
					return true;
				}
			}
			{
				const { collidesX, collidesY } = Entity.isColliding(
					{ pos: { x: x - CORNER_CORRECTION, y: y }, size: this.size },
					other,
				);

				if (!(collidesX && collidesY)) {
					const correction = other.pos.x - (x + this.size.x);
					this.pos.x += correction;
					return true;
				}
			}
		}
		return false;
	}

	private static checkPushing(a: Entity, b: Entity) {
		const aVelocityX = Math.abs(a.velocity.x);
		const bVelocityX = Math.abs(b.velocity.x);

		if (aVelocityX > bVelocityX) {
			a.isPushing = true;
		} else if (aVelocityX < bVelocityX) {
			b.isPushing = true;
		} else {
			a.isPushing = true;
			b.isPushing = true;
		}
	}

	public canBePushed(v: Vector2) {
		const entities = this.level!.entities;
		const newPos = { ...this.pos };
		newPos.x += v.x;
		newPos.y += v.y;

		for (let i = 0; i < entities.length; i++) {
			const e = entities[i];

			if (e.isDynamic || e.isPassable) continue;

			const { collidesX, collidesY } = Entity.isColliding({ pos: newPos, size: this.size }, e);

			if (collidesX && collidesY) return false;
		}

		return true;
	}

	// DYNAMIC COLLISIONS
	public static handleDynamicCollision(a: Entity, b: Entity) {
		if (a == b) return;
		if (a.isInsideDoor) return;
		if (b.isInsideDoor) return;

		if (b.checkGrounded(a)) {
			a.setGrounded();
			b.addRider(a);
		}
		if (a.checkGrounded(b)) {
			b.setGrounded();
			a.addRider(b);
		}

		const { collidesX, collidesY } = Entity.isColliding(a, b);
		if (!collidesX || !collidesY) return;

		const centerA: Vector2 = {
			x: a.pos.x + a.size.x / 2,
			y: a.pos.y + a.size.y / 2,
		};

		const centerB: Vector2 = {
			x: b.pos.x + b.size.x / 2,
			y: b.pos.y + b.size.y / 2,
		};

		const diff: Vector2 = {
			x: centerA.x - centerB.x,
			y: centerA.y - centerB.y,
		};

		const overlap: Vector2 = {
			x: (a.size.x + b.size.x) / 2 - Math.abs(diff.x),
			y: (a.size.y + b.size.y) / 2 - Math.abs(diff.y),
		};

		if (overlap.x < overlap.y) {
			if (diff.x > 0) {
				// Pushing out to the right

				const pushedA = a.canBePushed({ x: overlap.x / 2, y: 0 });
				const pushedB = b.canBePushed({ x: -overlap.x / 2, y: 0 });

				if (pushedA && pushedB) {
					a.pos.x += overlap.x / 2;
					b.pos.x -= overlap.x / 2;
				} else if (pushedA) {
					a.pos.x += overlap.x;
				} else {
					b.pos.x -= overlap.x;
				}

				Entity.checkPushing(a, b);
			} else {
				// Pushing out to the left

				const pushedA = a.canBePushed({ x: -overlap.x / 2, y: 0 });
				const pushedB = b.canBePushed({ x: overlap.x / 2, y: 0 });

				if (pushedA && pushedB) {
					a.pos.x -= overlap.x / 2;
					b.pos.x += overlap.x / 2;
				} else if (pushedA) {
					a.pos.x -= overlap.x;
				} else {
					b.pos.x += overlap.x;
				}

				Entity.checkPushing(a, b);
			}

			// Average seems better, try with other players
			const avergageSign = Math.sign(a.velocity.x * b.velocity.x);
			const averageVelocity =
				((Math.abs(a.velocity.x) + Math.abs(b.velocity.y)) / 4) * avergageSign;

			a.velocityStack.push({ x: -averageVelocity, y: 0 });
			b.velocityStack.push({ x: averageVelocity, y: 0 });
		} else if (overlap.x > overlap.y) {
			if (diff.y > 0) {
				if (a.isGrounded) {
					b.pos.y -= overlap.y;
				} else {
					a.pos.y += overlap.y / 2;
					b.pos.y -= overlap.y / 2;
				}

				b.setGrounded();
				a.addRider(b);
				// Pushing out upwards
				if (b.velocity.y > 0) {
					b.velocity.y = 0;
				}
			} else {
				if (b.isGrounded) {
					a.pos.y -= overlap.y;
				} else {
					a.pos.y -= overlap.y / 2;
					b.pos.y += overlap.y / 2;
				}

				a.setGrounded();
				b.addRider(a);

				if (a.velocity.y > 0) {
					a.velocity.y = 0;
				}
			}
		}

		if (a.type == "CannonProjectile") {
			a.level?.removeEntity(a);
		}
		if (b.type == "CannonProjectile") {
			a.level?.removeEntity(a);
		}
	}

	public addRider(rider: Entity) {
		if (!this.riders.includes(rider)) this.riders.push(rider);
	}

	public getData(): ServerEntityData {
		return {
			type: this.type,
			pos: this.pos,
			visualSize: this.size,
		};
	}

	public handleBehaviour(level: Level) {}

	public endTick() {
		this.velocityStack.forEach((v) => {
			this.velocity.x += v.x;
			this.velocity.y += v.y;
		});

		this.velocityStack = [];
	}

	public abstract clone(): Entity;
}
