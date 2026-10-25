import { ServerEntityData } from "./commonModels";

export type AnyEntityData =
	| ServerEntityData
	| ServerButtonData
	| ServerButtonDoorData
	| ServerLaserEntityData;

export interface ServerButtonData extends ServerEntityData {
	isPressed: boolean;
}

export interface ServerButtonDoorData extends ServerEntityData {
	isOpen: boolean;
}

export interface ServerLaserEntityData extends ServerEntityData {
	isActive: boolean;
}
