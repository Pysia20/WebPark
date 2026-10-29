import z from "zod";
import { EntityType } from "./commonLevelModels";
import { AnyEntityData } from "@shared/commonEntityData";

export type Vector2 = { x: number; y: number };
export type Vector3 = { x: number; y: number; z: number };
export type Vector4 = { x: number; y: number; z: number; w: number };

export interface PlayerInputs {
	left: boolean;
	right: boolean;
	jump: boolean;
	cursorPos: Vector2;
}

export interface ClientData {
	inputs: PlayerInputs;
}

export interface ServerData {
	playerData: Record<number, ServerPlayerData>;
	entityData: Record<number, AnyEntityData>;
}

export interface ServerPlayerData {
	nick: string;
	pos: Vector2;
	velocity: Vector2;
	isInsideDoor: boolean;
	isPushing: boolean;
	cursorPos: Vector2;
}

export interface ServerEntityData {
	type: EntityType;
	pos: Vector2;
	visualSize: Vector2;
}

export interface PlayerJoinedData {
	playerID: number;
	nick: string;
	color: string;
	level: string;
}

export type CollisionCheckResult = { // <=========================== I don't think this should be here ngl ====================================
	overlapX: number;
	overlapY: number;
	diffX: number;
	diffY: number;
};

//###############################################################
// DEJMI TEGO NIE MUSISZ IMPORTOWAC NIGDZIE | IMPORTUJ TO NIZEJ
//###############################################################
export const RegisterUserDataZod = z
	.object({
		roomID: z.string().length(6),
		userID: z.number(),
		userNick: z.string(),
		color: z.string().length(7),
	})
	.strict();

export type RegisterUserData = z.infer<typeof RegisterUserDataZod>;

export type SomethingBrokeData = {
	name: string; // Name of the error (usually just default Error)
	message: string; // Description of the error
	eventName: string; // In which socket event the error occured
};
