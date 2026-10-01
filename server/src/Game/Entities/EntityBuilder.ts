import { EntityType } from "@shared/commonMapModels";
import { LOG } from "../../Logger";
import { Entity } from "./Entity";
import { Button } from "./Button";
import { Vector2 } from "@shared/commonModels";

export class EntityBuilder {
	public readonly type: EntityType;
	private position: Vector2 = { x: -1, y: -1 };
	private size: Vector2 = { x: -1, y: -1 };

	constructor(type: EntityType) {
		this.type = type;
	}

	public setPosition(pos: Vector2) {
		this.position = pos;
		return this;
	}

	public setSize(size: Vector2) {
		this.size = size;
		return this;
	}

	public build(): Entity {
		if (this.position.x == -1 || this.position.y == -1) {
			LOG.error(`Entity of type ${this.type} doesn't have set position.`);
			throw Error(`Entity of type ${this.type} doesn't have set position.`);
		}
		if (this.size.x == -1 || this.size.y == -1) {
			LOG.error(`Entity of type ${this.type} doesn't have set size.`);
			throw Error(`Entity of type ${this.type} doesn't have set size.`);
		}

		//* Possibility of dividing cases into seperate methods if more setup needed.
		switch (this.type) {
			case "JohnEntity":
				return new Entity(this.position, this.size);
			case "Button":
				return new Button(this.position, this.size);
			default:
				LOG.error(`Entity type not recognized / implemented (${this.type})`);
				throw Error(`Entity type not recognized / implemented (${this.type})`);
		}
	}
}
