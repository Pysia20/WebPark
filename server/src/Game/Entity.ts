import { EntityCustomFieldsData, EntityType } from "@shared/commonLevelModels";
import { ServerEntityData, Vector2 } from "@shared/commonModels";
import { Level } from "../Game/Level";
import { RequiredField } from "../Global";
import { LOG } from "../Logger";
import { GROUND_DETECTON_OFFSET } from "@shared/commonVariables";
import { Player } from "./Player";

export interface CollisionOutput {
	correctionX: number;
	correctionY: number;
	isGrounded: boolean; // If other should be set as grounded after the collision
}

export abstract class Entity {
	public id: number = -1;
	public velocity: Vector2 = { x: 0, y: 0 };
	public level: Level | undefined;
	public isGrounded: boolean = false;
	public newPos: Vector2 = { x: 0, y: 0 };
	public newVelocity: Vector2 = { x: 0, y: 0 };

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

	public static isColliding(A: Entity, B: Entity): boolean {
		const { x: xA, y: yA } = A.pos;
		const { x: widthA, y: heightA } = A.size;

		const { x: xB, y: yB } = B.pos;
		const { x: widthB, y: heightB } = A.size;

		const isCollidingX = xB < xA + widthA && xA < xB + widthB;
		const isCollidingY = yB < yA + heightA && yA < yB + heightB;

		return isCollidingX && isCollidingY;
	}

	protected checkGrounded(other: Entity): boolean {
		const xA = this.pos.x;
		const yA = this.pos.y + GROUND_DETECTON_OFFSET;
		const { x: widthA, y: heightA } = this.size;

		const { x: xB, y: yB } = other.pos;
		const { x: widthB, y: heightB } = other.size;

		const isCollidingX = xB < xA + widthA && xA < xB + widthB;
		const isCollidingY = yB < yA + heightA && yA < yB + heightB;

		return isCollidingX && isCollidingY;
	}

	public handleCollision(other: Entity) {
		if (!Entity.isColliding(this, other)) {
			const isTopTouching = this.checkGrounded(other);
			if (isTopTouching) {
				this.onUpTouching(other);
			}

			return {
				correctionX: 0,
				correctionY: 0,
				isGrounded: isTopTouching,
			};
		}

		if (this.type == "MapCollider") {
			console.log("AAA");
		}
		const centerA: Vector2 = {
			x: this.pos.x + this.size.x / 2,
			y: this.pos.y + this.size.y / 2,
		};

		const centerB: Vector2 = {
			x: other.pos.x + other.size.x / 2,
			y: other.pos.y + other.size.y / 2,
		};

		const diffX = centerA.x - centerB.x;
		const diffY = centerA.y - centerB.y;

		const overlapX = (this.size.x + other.size.x) / 2 - Math.abs(diffX);
		const overlapY = (this.size.y + other.size.y) / 2 - Math.abs(diffY);

		let output: CollisionOutput = {
			correctionX: 0,
			correctionY: 0,
			isGrounded: false,
		};

		if (overlapX < overlapY) {
			// Horizontal collision
			if (diffX > 0) {
				// Pushing out to the right
				const temp = this.onRightCollision({ x: -overlapX, y: 0 }, other);
				if (temp) output = temp;
			} else {
				// Pushing out to the left
				const temp = this.onLeftCollision({ x: overlapX, y: 0 }, other);
				if (temp) output = temp;
			}
		} else {
			if (diffY > 0) {
				// Pushing out downwards
				const temp = this.onDownCollision({ x: 0, y: overlapY }, other);
				if (temp) output = temp;
			} else {
				// Pushing out upwards
				const temp = this.onUpCollision({ x: 0, y: -overlapY }, other);
				if (temp) output = temp;
			}
		}

		other.newPos.x += output.correctionX;
		other.newPos.y -= output.correctionY;

		if (output.correctionX != 0) {
			other.newVelocity.x = 0;
		}
		if (output.correctionY != 0) {
			other.newVelocity.y = 0;
		}
		if (output.isGrounded) {
			other.isGrounded = true;
		}

		other.onAnyCollision(other);
	}

	protected onRightCollision(overlap: Vector2, other: Entity): CollisionOutput | undefined {
		return { correctionX: overlap.x, correctionY: overlap.y, isGrounded: false };
	}

	protected onLeftCollision(overlap: Vector2, other: Entity): CollisionOutput | undefined {
		return { correctionX: overlap.x, correctionY: overlap.y, isGrounded: false };
	}

	protected onDownCollision(overlap: Vector2, other: Entity): CollisionOutput | undefined {
		return { correctionX: overlap.x, correctionY: overlap.y, isGrounded: false };
	}

	protected onUpCollision(overlap: Vector2, other: Entity): CollisionOutput | undefined {
		return { correctionX: overlap.x, correctionY: overlap.y, isGrounded: true };
	}

	protected onAnyCollision(other: Entity) {}

	protected onUpTouching(other: Entity): void {
		other.newVelocity.y = 0;
		other.isGrounded = true;
	}

	public getData(): ServerEntityData {
		return {
			type: this.type,
			pos: this.pos,
			visualSize: this.size,
		};
	}

	public handleBehaviour(level: Level) {}

	public swapPosition() {
		this.pos = { ...this.newPos };
		this.velocity = { ...this.newVelocity };
	}

	public endTick() {
		this.isGrounded = false;
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
