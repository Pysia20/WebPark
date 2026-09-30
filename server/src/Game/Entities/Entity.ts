import { Vector2 } from "@shared/commonModels";
import { Player } from "../Player";
import { PLAYER_CONFIG } from "@shared/commonVariables";
import { isColliding } from "../../Global";

export class Entity {
	public pos: Vector2 = { x: 0, y: 0 };
	public size: Vector2 = { x: 0, y: 0 };

	/**
	 * Entity: Should be overriten on children
	 *
	 * @param p
	 * @param playerNewPos
	 * @param playerNewVel
	 */
	public handleCollisions(p: Player, playerNewPos: Vector2, playerNewVel: Vector2): boolean {
		const { overlapX, overlapY, diffX, diffY } = isColliding(p, this);

		let changeGrounded: boolean = false;

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
				}
			}
		}

		return changeGrounded;
	}

	public getTypeName(): string {
		return this.constructor.name;
	}
}
