import { MapCollider } from "@shared/commonLevelModels";
import { LevelTemplate } from "./LevelTemplate";
import { Entity } from "./Entities/Entity";
import { Room } from "./Room";
import { PlayerSpawner } from "./Entities/PlayerSpawner";

export class Level {
	public readonly levelTemplate: LevelTemplate;
	public readonly activationStates: Map<string, number> = new Map<string, number>();

	private width: number = -1;
	private height: number = -1;
	public entities: Entity[] = [];
	public group!: string;
	public groupIndex!: number;
	public spawners: PlayerSpawner[] = [];

	public room: Room;
	public shouldRestart: boolean = false;

	constructor(template: LevelTemplate, room: Room) {
		this.levelTemplate = template;
		this.room = room;

		this.reloadLevel();
	}

	public reloadLevel() {
		this.group = this.levelTemplate.group;
		this.groupIndex = this.levelTemplate.groupIndex;

		this.entities = [];
		this.spawners = [];
		this.levelTemplate.entities.forEach((e) => {
			this.entities.push(e.clone());
			if (e.customFields.ActivationGroup) {
				this.activationStates.set(e.customFields.ActivationGroup, 0);
			}
		});

		for (let i = this.entities.length - 1; i >= 0; i--) {
			if (this.entities[i] instanceof PlayerSpawner) {
				this.spawners.push(this.entities[i]);
				this.entities.splice(i, 1);
			}
		}

		this.room.respawnPlayers(this);
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
		for (let e of this.entities) {
			e.handleBehaviour(this);
			if (this.shouldRestart) {
				this.shouldRestart = false;
				this.reloadLevel();
				break;
			}
		}
	}
}
