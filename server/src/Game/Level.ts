import { MapCollider } from "@shared/commonLevelModels";
import { LevelTemplate } from "./LevelTemplate";
import { Entity } from "./Entities/Entity";
import { Room } from "./Room";
import { Button } from "./Entities/Button";
import { Door } from "./Entities/Door";
import { MAP_LOADER } from "./LevelLoader";
import { keyof } from "zod";
import { ButtonDoor } from "./Entities/ButtonDoor";
import { LOG } from "../Logger";

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
			if (e.activationGroup != "") {
				this.activationStates.set(e.activationGroup, 0);
			}
		});
	}

	public getColliders(): MapCollider[] {
		return this.levelTemplate.colliders;
	}

	public getID(): string {
		return this.levelTemplate.id;
	}

	public handleEntites(room: Room) {
		this.entities.forEach((e) => {
			if (e instanceof Button) {
				if (e.hasChanged) {
					const prevCount = this.activationStates.get(e.activationGroup)!;
					if (e.isPressed) {
						this.activationStates.set(e.activationGroup, prevCount + 1);
					} else {
						this.activationStates.set(e.activationGroup, prevCount - 1);
					}
				}
				console.log(e.hasChanged);
			} else if (e instanceof Door) {
				const nextLevelID = MAP_LOADER.GetNextLevel(this.group, this.groupIndex)?.getID();

				if (nextLevelID === undefined) {
					// End of group
					return;
				}

				e.enterDoor(nextLevelID);
			} else if (e instanceof ButtonDoor) {
				const activationGroup: string = e.activationGroup;
				const activationCount: number = e.activationCount;

				if (activationGroup == "") return;

				if (
					activationCount != -1 &&
					activationCount <= this.activationStates.get(activationGroup)!
				) {
					e.isPassable = true;
				} else {
					e.isPassable = false;
				}
				console.log("Bdoor: activation state: " + this.activationStates.get(activationGroup));
			}
		});
	}
}
