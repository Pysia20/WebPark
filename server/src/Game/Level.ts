import { LevelTemplate } from "./LevelTemplate";
import { JohnEntity } from "./Entities/JohnEntity";
import { Room } from "./Room";
import { PlayerSpawner } from "./Entities/PlayerSpawner";
import { LOG } from "../Logger";
import { Entity } from "./Entity";
import { MapCollider } from "./Entities/MapCollider";
import { Portal } from "./Entities/Portal";
import { forceGC } from "../Global";

export class Level {
	public readonly levelTemplate: LevelTemplate;
	public readonly activationStates: Map<string, number> = new Map<string, number>();

	public width: number = -1;
	public height: number = -1;
	public entities: Entity[] = [];
	public group!: string;
	public groupIndex!: number;
	public spawners: PlayerSpawner[] = [];
	public portals = new Map<string, [Portal | undefined, Portal | undefined]>();
	public nextEntityID = 0;

	public room: Room;
	public shouldRestart: boolean = false;

	constructor(template: LevelTemplate, room: Room) {
		this.levelTemplate = template;
		this.width = this.levelTemplate.width;
		this.height = this.levelTemplate.height;
		this.room = room;
	}

	public reloadLevel() {
		this.group = this.levelTemplate.group;
		this.groupIndex = this.levelTemplate.groupIndex;

		this.portals.clear();
		this.entities = [];
		this.spawners = [];
		this.levelTemplate.entities.forEach((originalEntity) => {
			const clone: Entity = originalEntity.clone();
			clone.id = this.entities.length;
			clone.setLevel(this);
			this.entities.push(clone);
			if (clone.customFields.ActivationGroup.doesExist) {
				this.activationStates.set(clone.customFields.ActivationGroup.value!, 0);
			}

			if (clone.type == "Portal") {
				let tuple: [Portal | undefined, Portal | undefined] | undefined = this.portals.get(
					clone.customFields.PortalGroup.value!,
				);

				if (tuple == undefined) {
					tuple = [undefined, undefined];
				}

				if (!tuple?.[0]) {
					tuple[0] = clone as Portal;
				} else if (!tuple?.[1]) {
					tuple[1] = clone as Portal;
				} else {
					const message = `Too many portals of group: "${clone.customFields.PortalGroup.value}". Max 2.`;
					LOG.error(message);
					throw new Error(message);
				}

				this.portals.set(clone.customFields.PortalGroup.value!, tuple);
			}
		});

		for (const [group, tuple] of this.portals) {
			if (!tuple[0] || !tuple[1]) {
				const message = `Not enouth portals in group "${group}". 1/2.`;
				LOG.error(message);
				throw new Error(message);
			}
		}

		for (let i = this.entities.length - 1; i >= 0; i--) {
			const entity: Entity = this.entities[i];
			if (entity instanceof PlayerSpawner) {
				this.spawners.push(entity);
			}
		}

		this.room.respawnPlayers(this);

		this.entities = [
			...this.entities,
			...this.room.getPlayers().values(),
			...this.getColliders(),
		];

		this.entities.forEach((e) => e.init());
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

	public addEntity(e: Entity) {
		e.level = this;
		e.id = this.entities.length;
		this.entities.push(e);
	}

	public removeEntity(e: Entity) {}

	public physicsUpdate() {
		// WHAT SHOULD BE HAPPENING
		// 1. CALCULATE FORCES
		this.entities.forEach((e) => e.calculateVelocities());
		// 2. Move Axis 1
		this.entities.forEach((e) => e.moveXAxis());

		// 3. Collisions for Axis 1
		this.entities.forEach((e) => {
			this.entities.forEach((other) => {
				if (other == e) return;
				e.calculateCollisionsX(other);
			});
		});

		// 4. Move Axis 2
		this.entities.forEach((e) => e.moveYAxis());
		// 5. Collisions for Axis 2
		this.entities.forEach((e) => {
			this.entities.forEach((other) => {
				if (other == e) return;
				e.calculateCollisionsY(other);
			});
		});

		const dynamicEntities: Entity[] = [];

		this.entities.forEach((e) => {
			if (e.isDynamic) dynamicEntities.push(e);
		});

		for (let i = 0; i < dynamicEntities.length; i++) {
			for (let j = i + 1; j < dynamicEntities.length; j++) {
				const a = dynamicEntities[i];
				const b = dynamicEntities[j];

				Entity.handleDynamicCollision(a, b);
			}
		}

		// 6. Other behaviour

		this.entities.forEach((e) => e.handleBehaviour(this));

		if (this.shouldRestart) {
			this.shouldRestart = false;
			this.reloadLevel();
		}

		this.entities.forEach((e) => e.endTick());

		this.room.sendLevelReloaded();
	}
}
