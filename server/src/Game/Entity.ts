import {
	CustomField,
	DummyEntityCustomFields,
	EntityCustomFieldsData,
	EntityType,
} from "@shared/commonLevelModels";
import { Vector2 } from "@shared/commonModels";
import { Level } from "pino";
import { RequiredField } from "../Global";
import { LOG } from "../Logger";

export interface CollisionOutput {
	correctionX: number;
	correctionY: number;
	isGrounded: boolean; // If other should be set as grounded after the collision
}

abstract class Entity {
	public readonly type: EntityType = "JohnEntity";
	public velocity: Vector2 = { x: 0, y: 0 };
	public level: Level | undefined;
	// public readonly usedFields: RequiredField[] = [];

	public getUsedFields(): RequiredField[] {
		return [];
	}

	constructor(
		public pos: Vector2,
		public size: Vector2,
		public customFields: EntityCustomFieldsData,
	) {
		this.pos = { ...pos };
		this.size = { ...size };
		this.customFields = this.validateCustomFields(customFields);
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

	public handleCollision(other: Entity): CollisionOutput {
		if (!Entity.isColliding(this, other)) {
			return {
				correctionX: 0,
				correctionY: 0,
				isGrounded: false,
			};
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

		if (overlapX < overlapY) {
			// Horizontal collision
			if (diffX > 0) {
				// Pushing out to the right
				this.onCollisonRight(other);
			} else {
				// Pushing out to the left
				this.onCollisonLeft(other);
			}
		} else {
			if (diffY > 0) {
				// Pushing out downwards
				this.onCollisonDown(other);
			} else {
				// Pushing out upwards
				this.onCollisonUp(other);
			}
		}

		return {
			correctionX: 0,
			correctionY: 0,
			isGrounded: false,
		};
	}

	public onCollisonUp(other: Entity) {}
	public onCollisonDown(other: Entity) {}
	public onCollisonLeft(other: Entity) {}
	public onCollisonRight(other: Entity) {}

	public clone(): Entity {
		return this; // In non-abstract entities call a constructor
	}
}

export abstract class StaticEntity extends Entity {
	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields);
	}
}
export abstract class DynamicEntity extends Entity {}

export class ExampleStaticEntity extends StaticEntity {
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

	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields);
	}
}
