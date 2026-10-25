import { Vector2 } from "@shared/commonModels";
import { Entity } from "../Entity";
import { EntityCustomFieldsData } from "@shared/commonLevelModels";
import { RequiredField } from "../../Global";

export class Portal extends Entity {
	public override getUsedFields(): RequiredField[] {
		return [
			{
				name: "PortalGroup",
				value: this.customFields.PortalGroup.value,
				isMissing: (v) => v === "" || !v,
				isRequired: true,
			},
		];
	}

	public otherPortal: Portal | undefined;

	constructor(pos: Vector2, size: Vector2, customFields: EntityCustomFieldsData) {
		super(pos, size, customFields, "Portal");
	}

	public clone() {
		return new Portal({ ...this.pos }, { ...this.size }, { ...this.customFields });
	}
}
