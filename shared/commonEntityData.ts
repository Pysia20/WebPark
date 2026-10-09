import { ServerEntityData } from "./commonModels";

export type AnyEntityData = ServerEntityData | ServerButtonData | ServerButtonDoorData

export interface ServerButtonData extends ServerEntityData {
	isPressed: boolean;
}

export interface ServerButtonDoorData extends ServerEntityData {
	isOpen: boolean;
}
