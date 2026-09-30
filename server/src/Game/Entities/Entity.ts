import { Vector2 } from "@shared/commonModels";
import { Player } from "../Player";

export class Entity {
	public pos: Vector2 = { x: 0, y: 0 };
	public size: Vector2 = { x: 0, y: 0 };

	public handleCollisions(p: Player, playerNewPos: Vector2, playerNewVel: Vector2) {}
}
