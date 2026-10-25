import { EntityCustomField } from "@shared/commonLevelModels";
import { Room } from "./Game/Room";
import v8 from "node:v8";
import vm from "node:vm";

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

export interface RequiredField {
	name: EntityCustomField;
	value: any;
	isMissing: (v: any) => boolean;
	isRequired: boolean;
}

// Create the tracker
export const garbageRegistry = new FinalizationRegistry((instanceId: string) => {
	console.log(`\n🗑️ [${instanceId}] was successfully DELETED from memory!`);
});

//? Garbage collection help

// v8.setFlagsFromString("--expose_gc");
// const gc = vm.runInNewContext("gc");

// // Helper to trigger Garbage Collection
// export function forceGC() {
// 	if (typeof gc === "function") gc();
// 	else console.warn("Run with --expose-gc flag!");
// }

// garbageRegistry.register(this, id);
