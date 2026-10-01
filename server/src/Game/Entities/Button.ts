import { Vector2 } from "@shared/commonModels";
import { Player } from "../Player";
import { Entity } from "./Entity";
import { isColliding } from "../../Global";

export class Button extends Entity {
	public pos: Vector2 = { x: -1, y: -1 };
	public size: Vector2 = { x: -1, y: -1 };
	public visualSize: Vector2 = { x: -1, y: -1 };
	public isPressed: boolean = false;

	constructor(pos: Vector2, size: Vector2) {
		super(pos, size);
		this.visualSize = { x: this.size.x * 2, y: this.size.y * 2 };
	}

	public override handleCollisions(
		p: Player,
		playerNewPos: Vector2,
		playerNewVel: Vector2,
	): boolean {
		const { overlapX, overlapY, diffX, diffY } = isColliding(p, this);

		let changeGrounded: boolean = false;
		this.isPressed = false;

		if (overlapX == -1 || overlapY == -1) return changeGrounded;

		if (overlapX < overlapY) {
			// Horizontal collison

			if (diffX > 0) {
				// A is going left towards B
				// Pushing out to the right

				if (playerNewVel.x < 0) {
					playerNewPos.x += overlapX;
					playerNewVel.x = 0;
				}
			} else {
				// A is going right towards B
				// Pushing out to the left
				if (playerNewVel.x > 0) {
					playerNewPos.x -= overlapX;
					playerNewVel.x = 0;
				}
			}
		} else {
			// Vertical collision
			if (diffY > 0) {
				// A is going up towards B
				// Pushing out downwards
				if (playerNewVel.y < 0) {
					playerNewPos.y += overlapY;
					playerNewVel.y = 0;
				}
			} else {
				// A is goung down towards B
				// Pushign out upwards

				if (playerNewVel.y > 0) {
					playerNewPos.y -= overlapY;
					playerNewVel.y = 0;
					changeGrounded = true;
					this.isPressed = true;
				}
			}
		}

		return changeGrounded;
	}
}
