import { MapCollider } from "@shared/commonLevelModels";
import { LevelTemplate } from "./LevelTemplate";
import { Entity } from "./Entities/Entity";
import { Room } from "./Room";

export class Level {
	public readonly levelTemplate: LevelTemplate;
	public readonly activationStates: Map<string, number> = new Map<string, number>();

	private width: number = -1;
	private height: number = -1;
	public readonly entities: Entity[] = [];
	public readonly group: string;
	public readonly groupIndex: number;

	constructor(template: LevelTemplate) {
		this.levelTemplate = template;
		this.group = template.group;
		this.groupIndex = template.groupIndex;

		template.entities.forEach((e) => {
			this.entities.push(e.clone());
			if (e.customFields.ActivationGroup) {
				this.activationStates.set(e.customFields.ActivationGroup, 0);
			}
		});
	}

	public getColliders(): MapCollider[] {
		return this.levelTemplate.colliders;
	}

	public getID(): string {
		return this.levelTemplate.id;
	}

	public endTick() {
		this.entities.forEach((e) => {
			e.endTick();
		});
	}

	public handleEntites(room: Room) {
		this.entities.forEach((e) => {
			e.handleBehaviour(this);
		});
	}
}
