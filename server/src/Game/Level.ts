import { LevelTemplate } from "./LevelTemplate";
import { JohnEntity } from "./Entities/JohnEntity";
import { Room } from "./Room";
import { PlayerSpawner } from "./Entities/PlayerSpawner";
import { LOG } from "../Logger";
import { Entity } from "./Entity";
import { MapCollider } from "./Entities/MapCollider";

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
	}

	public reloadLevel() {
		this.group = this.levelTemplate.group;
		this.groupIndex = this.levelTemplate.groupIndex;

		this.entities = [];
		this.spawners = [];
		this.levelTemplate.entities.forEach((e) => {
			const clone: Entity = e.clone();
			clone.id = this.entities.length;
			clone.setLevel(this);
			this.entities.push(clone);
			if (e.customFields.ActivationGroup.doesExist) {
				this.activationStates.set(e.customFields.ActivationGroup.value!, 0);
			}
		});

		for (let i = this.entities.length - 1; i >= 0; i--) {
			const entity: Entity = this.entities[i];
			if (entity instanceof PlayerSpawner) {
				this.spawners.push(entity);
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

	public physicsUpdate() {
		this.room.players.forEach((player, id) => {
			player.handleBehaviour(this);
		});
		this.entities.forEach((e) => {
			e.handleBehaviour(this);
		});

		this.room.players.forEach((player, id) => {
			this.room.players.forEach((p) => {
				p.handleCollision(player);
			});
			this.entities.forEach((e) => {
				e.handleCollision(player);
			});
			this.getColliders().forEach((c) => {
				c.handleCollision(player);
			});
		});

		this.room.players.forEach((p, id) => {
			p.endTick();
		});
		this.getColliders().forEach((c) => {
			c.endTick();
		});
		this.entities.forEach((e) => {
			e.endTick();
		});

		if (this.shouldRestart) {
			this.shouldRestart = false;
			this.reloadLevel();
		}
	}
}
