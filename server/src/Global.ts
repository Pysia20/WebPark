import { MapCollider } from "@shared/commonLevelModels";
import { Room } from "./Game/Room";
import { Entity } from "./Game/Entities/Entity";
import { Player } from "./Game/Player";
import { CollisionCheckResult, Vector2 } from "@shared/commonModels";
import { LOG } from "./Logger";
import { PLAYER_CONFIG } from "@shared/commonVariables";
import { diff } from "node:util";

export const games: Map<string, Room> = new Map<string, Room>();

export function generateRoomCode() {
	const CODE_LENGHT = 6;
	const chars = "qwertyuiopasdfghjklzxcvbnm1234567890";
	let result = "";
	const MAX_TRIES = 20;
	let tries = 0;

	while (tries < MAX_TRIES) {
		tries++;

		result = "";
		for (let i = 0; i < CODE_LENGHT; i++) {
			let index = Math.floor(Math.random() * chars.length);
			result += chars[index];
		}
		result = result.toUpperCase();

		let isUnique = true;

		games.forEach((_value, key) => {
			if (key == result) {
				isUnique = false;
				return true; // This is really just a 'break;' it doesnt return anything usefull;
			}
		});

		if (isUnique) {
			return result;
		}
	}

	throw Error("Too many attempts at generating uniqe room ID.");
}

export function clamp(v: number, min: number, max: number) {
	return Math.min(max, Math.max(v, min));
}

function extractTransform(object: Player | MapCollider | Entity): [number, number, number, number] {
	let x, y, width, height;

	if (object instanceof Player) {
		x = object.pos.x;
		y = object.pos.y;
		width = PLAYER_CONFIG.WIDTH;
		height = PLAYER_CONFIG.HEIGHT;
	} else if (object instanceof MapCollider) {
		x = object.x;
		y = object.y;
		width = object.width;
		height = object.height;
	} else if (object instanceof Entity) {
		x = object.pos.x;
		y = object.pos.x;
		width = object.size.x;
		height = object.size.y;
	} else {
		LOG.error("Invalid object A in collision detection.");
		throw Error("Invalid object A in collision detection.");
	}

	return [x, y, width, height];
}

//! Something bad happens, between the arrow and block there is a gap in colliders.
// Maybe fronted badly scales the map

// Wierd lag spike each second.

/**
 *
 * @param objectA
 * @param objectB
 *
 * @returns {Vector2} - If collides, returns overlaps, otherwise returns {-1,-1}
 */
export function isColliding(
	objectA: Player | MapCollider | Entity,
	objectB: Player | MapCollider | Entity,
): CollisionCheckResult {
	let [xA, yA, widthA, heightA] = extractTransform(objectA);
	let [xB, yB, widthB, heightB] = extractTransform(objectB);

	const isCollidingX = xB < xA + widthA && xA < xB + widthB;
	const isCollidingY = yB < yA + heightA && yA < yB + heightB;

	if (!isCollidingX || !isCollidingY) return { overlapX: -1, overlapY: -1, diffX: -1, diffY: -1 }; // Objects arent colliding

	const centerA: Vector2 = {
		x: xA + widthA / 2,
		y: yA + heightA / 2,
	};

	const centerB: Vector2 = {
		x: xB + widthB / 2,
		y: yB + heightB / 2,
	};

	const diffX = centerA.x - centerB.x;
	const diffY = centerA.y - centerB.y;

	const overlapX = widthA / 2 + widthB / 2 - Math.abs(diffX);
	const overlapY = heightA / 2 + heightB / 2 - Math.abs(diffY);

	return { overlapX: overlapX, overlapY: overlapY, diffX: diffX, diffY: diffY };
}
