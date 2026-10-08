import { ServerEntityData } from "./commonModels";

export interface ServerButtonData extends ServerEntityData {
	isPressed: boolean;
}

export interface ServerButtonDoorData extends ServerEntityData {
	isOpen: boolean;
}
