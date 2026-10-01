import { Vector2 } from "@shared/commonModels";
import { Player } from "../Player";
import { Entity } from "./Entity";

export class Button extends Entity {
	public pos: Vector2 = { x: 0, y: 0 };
	public size: Vector2 = { x: 0, y: 0 };

	// public override handleCollisions(
	// 	p: Player,
	// 	playerNewPos: Vector2,
	// 	playerNewVel: Vector2,
	// ): boolean {
	// 	throw new Error("Method not implemented.");
	// }
}
