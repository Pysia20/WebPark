import { Room } from "./Game/Room";

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
