import {
	DummyEntityCustomFields,
	EntityCustomFieldsData,
	EntityType,
} from "@shared/commonLevelModels";
import { ServerEntityData, Vector2 } from "@shared/commonModels";
import { Level } from "../Game/Level";
import { isColliding, RequiredField } from "../Global";
import { LOG } from "../Logger";
import { COLLISION_MARGIN_X, GROUND_DETECTON_OFFSET } from "@shared/commonVariables";
import { overwrite } from "zod";
import CONFIG from "../../config.json";

export abstract class Entity {
	public id: number = -1;
	public velocity: Vector2 = { x: 0, y: 0 };
	public level: Level | undefined;
	public isGrounded: boolean = false;
	public isDynamic: boolean = false;
	public velocityStack: Vector2[] = [];

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
						`${this.type} doesn't have an '${field.name}' custom field or it's value is invalid. (${this.pos.x}, ${this.pos.y})`,
					);
					throw Error(
						`${this.type} doesn't have an '${field.name}' custom field or it's value is invalid. (${this.pos.x}, ${this.pos.y})`,
					);
				}

				LOG.warn(
					`${this.type} doesn't have an '${field.name}' custom field or it's value is invalid. (${this.pos.x}, ${this.pos.y})`,
				);
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

	protected checkGrounded(other: Entity): boolean {
		const xA = this.pos.x;
		const yA = this.pos.y;
		const { x: widthA, y: heightA } = this.size;

		const xB = other.pos.x;
		const yB = other.pos.y + GROUND_DETECTON_OFFSET;
		const { x: widthB, y: heightB } = other.size;

		const isCollidingX = xB < xA + widthA && xA < xB + widthB;
		const isCollidingY = yB < yA + heightA && yA < yB + heightB;

		return isCollidingX && isCollidingY;
	}

	public calculateCollisionsX(other: Entity) {
		const newPos = { ...other.pos };
		newPos.y += COLLISION_MARGIN_X / 2;
		const newSize = { ...other.size };
		newSize.y -= COLLISION_MARGIN_X / 2;

		const { collidesX, collidesY } = Entity.isColliding(this, { pos: newPos, size: newSize });
		if (collidesX && collidesY) {
			const centerA = this.pos.x + this.size.x / 2;
			const centerB = other.pos.x + other.size.x / 2;
			const diff = centerA - centerB;
			const overlap = (this.size.x + other.size.x) / 2 - Math.abs(diff);
			if (diff > 0) {
				// Horizontal collision
				// Pushing out to the right
				this.onRightCollision(overlap, other);
			} else {
				// Pushing out to the left
				this.onLeftCollision(overlap, other);
			}
		}
	}

	public calculateCollisionsY(other: Entity) {
		const { collidesX, collidesY } = Entity.isColliding(this, other);
		if (collidesX && collidesY) {
			const centerA = this.pos.y + this.size.y / 2;
			const centerB = other.pos.y + other.size.y / 2;
			const diff = centerA - centerB;
			const overlap = (this.size.y + other.size.y) / 2 - Math.abs(diff);
			if (diff > 0) {
				// Pushing out upwards
				this.onUpCollision(overlap, other);
			} else {
				// Pushing out downwards
				this.onDownCollision(overlap, other);
			}
		} else if (this.checkGrounded(other)) {
			this.onUpTouching(other);
		}
	}

	public calculateVelocities() {}

	public moveXAxis() {
		this.pos.x += this.velocity.x * (1 / CONFIG.TICKRATE);
	}

	public moveYAxis() {
		this.pos.y += this.velocity.y * (1 / CONFIG.TICKRATE);
	}

	protected onRightCollision(overlap: number, other: Entity) {
		other.pos.x -= overlap;
		other.velocity.x = 0;
	}

	protected onLeftCollision(overlap: number, other: Entity) {
		other.pos.x += overlap;
		other.velocity.x = 0;
	}

	protected onUpCollision(overlap: number, other: Entity) {
		other.pos.y -= overlap;
		if (other.velocity.y > 0) {
			other.velocity.y = 0;
		}
		other.isGrounded = true;
	}

	protected onDownCollision(overlap: number, other: Entity) {
		other.pos.y += overlap;
		if (other.velocity.y < 0) {
			other.velocity.y = 0;
		}
	}

	protected onAnyCollision(other: Entity) {}

	protected onUpTouching(other: Entity): void {
		if (other.velocity.y > 0) {
			other.velocity.y = 0;
		}
		other.isGrounded = true;
	}

	// DYNAMIC COLLISIONS

	public static handleDynamicCollision(a: Entity, b: Entity) {
		if (a == b) return;

		const { collidesX, collidesY } = Entity.isColliding(a, b);
		if (collidesX && collidesY) {
			const averageVelocity: Vector2 = {
				x: (a.velocity.x + b.velocity.x) / 4,
				y: (a.velocity.y + b.velocity.y) / 4,
			};

			const centerA: Vector2 = {
				x: a.pos.x + a.size.x / 2,
				y: a.pos.y + a.size.y / 2,
			};

			const centerB: Vector2 = {
				x: b.pos.x + b.size.x / 2,
				y: b.pos.y + b.size.y / 2,
			};

			const diffX = centerA.x - centerB.x;
			const diffY = centerA.y - centerB.y;

			const overlapX = (a.size.x + b.size.x) / 2 - Math.abs(diffX);
			const overlapY = (a.size.y + b.size.y) / 2 - Math.abs(diffY);

			if (overlapX < overlapY) {
				// Horizontal collision
				if (diffX > 0) {
					// Pushing out to the right
					a.pos.x += overlapX / 2;
					b.pos.x -= overlapX / 2;
				} else {
					// Pushing out to the left
					a.pos.x -= overlapX / 2;
					b.pos.x += overlapX / 2;
				}
			} else {
				if (diffY > 0) {
					a.pos.y += overlapY / 2;
					if (a.velocity.y < 0) {
						a.velocity.y = 0;
					}

					// Pushing out upwards
					b.pos.y -= overlapY / 2;
					b.isGrounded = true;
					if (b.velocity.y > 0) {
						b.velocity.y = 0;
					}
				} else {
					a.pos.y -= overlapY / 2;
					a.isGrounded = true;
					if (a.velocity.y > 0) {
						a.velocity.y = 0;
					}

					// Pushing out downwards
					b.pos.y += overlapY / 2;
					if (b.velocity.y < 0) {
						b.velocity.y = 0;
					}
				}
			}

			a.velocityStack.push({ ...averageVelocity });
			b.velocityStack.push({ ...averageVelocity });
		}
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

export class ExampleStaticEntity extends Entity {
	public getUsedFields(): RequiredField[] {
		return [
			{
				name: "ActivationCount",
				value: this.customFields.ActivationCount.value,
				isRequired: true,
				isMissing: (v) => !v || v <= 0,
			},
		];
	}

	constructor(
		pos: Vector2,
		size: Vector2,
		customFields: EntityCustomFieldsData,
		type: EntityType,
	) {
		super(pos, size, customFields, type);
	}

	public clone() {
		return new ExampleStaticEntity(
			{ ...this.pos },
			{ ...this.size },
			{
				...this.customFields,
			},
			this.type,
		);
	}
}
