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
	public allEntities: Entity[] = [];
	public dynamicEntities: Entity[] = [];
	public staticEntities: Entity[] = [];
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

		this.dynamicEntities = [];
		this.staticEntities = [];
		this.allEntities = [];
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
			if (e.isDynamic) {
				this.dynamicEntities.push(e);
			} else {
				this.staticEntities.push(e);
			}
		});

		for (let i = this.entities.length - 1; i >= 0; i--) {
			const entity: Entity = this.entities[i];
			if (entity instanceof PlayerSpawner) {
				this.spawners.push(entity);
			}
		}

		this.room.respawnPlayers(this);

		this.allEntities = [
			...this.entities,
			...this.room.getPlayers().values(),
			...this.getColliders(),
		];

		this.staticEntities = [...this.staticEntities, ...this.getColliders()];

		this.dynamicEntities = [...this.dynamicEntities, ...this.room.getPlayers().values()];
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
		// WHAT SHOULD BE HAPPENING
		// 1. CALCULATE FORCES
		this.allEntities.forEach((e) => e.calculateVelocities());
		// 2. Move Axis 1
		this.allEntities.forEach((e) => e.moveXAxis());

		// 3. Collisions for Axis 1
		this.allEntities.forEach((e) => {
			this.allEntities.forEach((other) => {
				if (other == e) return;
				e.calculateCollisionsX(other);
			});
		});

		// 4. Move Axis 2
		this.allEntities.forEach((e) => e.moveYAxis());
		// 5. Collisions for Axis 2
		this.allEntities.forEach((e) => {
			this.allEntities.forEach((other) => {
				if (other == e) return;
				e.calculateCollisionsY(other);
			});
		});
		// 6. Other behaviour

		this.allEntities.forEach((e) => e.handleBehaviour(this));

		if (this.shouldRestart) {
			this.reloadLevel();
		}

		for (let i = 0; i < this.dynamicEntities.length; i++) {
			for (let j = i + 1; j < this.dynamicEntities.length; j++) {
				const a = this.dynamicEntities[i];
				const b = this.dynamicEntities[j];

				Entity.handleDynamicCollision(a, b);
			}
		}
	}
}
