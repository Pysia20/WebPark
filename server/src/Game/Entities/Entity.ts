import { Vector2 } from "@shared/commonModels";
import { Player } from "../Player";
import { PLAYER_CONFIG } from "@shared/commonVariables";

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
		// Add calculate overlaps function;

		const playerWidth = PLAYER_CONFIG.WIDTH;
		const playerHeight = PLAYER_CONFIG.HEIGHT;

		let changeGrounded: boolean = false;

		const isCollidingX =
			this.pos.x < playerNewPos.x + playerWidth && playerNewPos.x < this.pos.x + this.size.x;
		const isCollidingY =
			playerNewPos.y + playerHeight > this.pos.y && playerNewPos.y < this.pos.y + this.size.y;

		if (!isCollidingX || !isCollidingY) return false; // Players arent colliding

		const centerA: Vector2 = {
			x: playerNewPos.x + playerWidth / 2,
			y: playerNewPos.y + playerHeight / 2,
		};

		const centerB: Vector2 = {
			x: this.pos.x + this.size.x / 2,
			y: this.pos.y + this.size.y / 2,
		};

		const diffX = centerA.x - centerB.x;
		const diffY = centerA.y - centerB.y;

		const overlapX = playerWidth / 2 + this.size.x / 2 - Math.abs(diffX);
		const overlapY = playerHeight / 2 + this.size.y / 2 - Math.abs(diffY);

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
