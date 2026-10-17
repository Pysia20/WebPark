import { Entity } from "../Entity";

//! ====================
//! 	TO BE CHANGED
//! ====================

//! DO NOT IMPORT!!!
//? IT IS A TEMPLATE FOR CREATING NEW ENTITY TYPES
//? IT IS NOT USED ANYWARE IN THE CODEBASE
//TODO Change this name and clone()
//TODO Add the name to the EntityType in commonModels
//TODO Add to the TYPE_MAP in the EntityBuilder

export class ENTITY_NAME extends Entity {
	public clone() {
		return new ENTITY_NAME(
			{ ...this.pos },
			{ ...this.size },
			{ ...this.customFields },
			"JohnEntity",
		);
	}
}
