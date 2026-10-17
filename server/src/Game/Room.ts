import { Namespace } from "socket.io";
import { Player } from "./Player";
import { PlayerInputs, ServerData, Vector2, ServerEntityData } from "@shared/commonModels";
import { PLAYER_CONFIG } from "@shared/commonVariables";
import { clamp, isColliding } from "../Global";
import { MAP_LOADER } from "./LevelLoader";
import { LOG } from "../Logger";
import { JohnEntity } from "./Entities/JohnEntity";
import { Level } from "./Level";
import CONFIG from "../../config.json";
import { PlayerSpawner } from "./Entities/PlayerSpawner";
import { io } from "socket.io-client";
import { MapCollider } from "./Entities/MapCollider";
import { Entity } from "./Entity";

export class Room {
	private TICKRATE: number = CONFIG.TICKRATE; // Per second
	private nextUserID: number = 0;

	private id: string;
	private players: Map<number, Player> = new Map<number, Player>();
	public level!: Level;
	private gameLoop: NodeJS.Timeout | undefined;

	private io: Namespace | undefined;

	constructor(id: string) {
		this.id = id;

		this.level = MAP_LOADER.GetLevel("Level_0", this);
	}

	public getID(): string | undefined {
		return this.id;
	}

	public addPlayer(p: Player) {
		this.players.set(p.id, p);
	}

	/**It adds 1 to the nextUserID after it returns it!!! */
	public getNextUserID() {
		this.nextUserID++;
		return this.nextUserID - 1;
	}

	public removePlayer(id: number) {
		this.players.delete(id);
	}

	public isEveryoneReady(): boolean {
		let isReady = true;

		this.players.forEach((player) => {
			if (!player.isReady) {
				isReady = false;
			}
		});

		return isReady;
	}

	public setPlayerReady(id: number, v: boolean) {
		this.players.get(id)!.isReady = v;
	}

	public respawnPlayers(l: Level) {
		let pIndex = 0;

		if (l.spawners.length == 0) {
			const message = "No spawners on level: " + l.getID();
			LOG.error(message);
			throw Error(message);
		}

		this.players.forEach((p) => {
			p.isInsideDoor = false;
			const spawner: PlayerSpawner = l.spawners[pIndex % l.spawners.length];
			const newPos = { ...spawner.pos };

			newPos.y -= 1.5 * PLAYER_CONFIG.HEIGHT * Math.ceil(pIndex / l.spawners.length);

			p.pos = { ...newPos };
			p.velocity = { x: 0, y: 0 };
			p.isGrounded = false;

			pIndex++;
		});
	}

	private physicsUpdate() {
		for (let [id, player] of this.players) {
			const input = player.lastInputs;

			if (player.velocity.x > PLAYER_CONFIG.DRAG) {
				player.velocity.x -= PLAYER_CONFIG.DRAG;
			} else if (player.velocity.x < -PLAYER_CONFIG.DRAG) {
				player.velocity.x += PLAYER_CONFIG.DRAG;
			} else {
				player.velocity.x = 0;
			}

			if (!player.isGrounded) {
				player.velocity.y += PLAYER_CONFIG.GRAVITY;
			}

			if (this.handleCollisions(player)) {
				player.isGrounded = true;
			}

			if (!player.isInsideDoor) {
				if (input.right) {
					player.velocity.x += PLAYER_CONFIG.ACCELERATION;
				}
				if (input.left) {
					player.velocity.x -= PLAYER_CONFIG.ACCELERATION;
				}
				if (input.jump && player.isGrounded) {
					player.velocity.y -= PLAYER_CONFIG.JUMP_FORCE;
					player.isGrounded = false;
				}
			}

			player.velocity.y = clamp(
				player.velocity.y,
				-PLAYER_CONFIG.MAX_VERTICAL_SPEED,
				PLAYER_CONFIG.MAX_VERTICAL_SPEED,
			);

			player.velocity.x = clamp(
				player.velocity.x,
				-PLAYER_CONFIG.MAX_HORIZONTAL_SPEED,
				PLAYER_CONFIG.MAX_HORIZONTAL_SPEED,
			);

			player.newPos.x += player.velocity.x * (1 / this.TICKRATE);
			player.newPos.y += player.velocity.y * (1 / this.TICKRATE);

			player.swapPosition();
		}

		this.level.handleEntites(this);

		this.level.endTick();
		this.players.forEach((p) => p.endTick());
	}

	private handleCollisions(player: Player): boolean {
		let isGrounded = false;

		this.players.forEach((p: Player) => {
			if (p.id == player.id) return;
			if (p.isInsideDoor) return;

			player.handleCollision(p);
		});

		this.level.getColliders().forEach((c: MapCollider) => {
			player.handleCollision(c);
		});

		this.level.entities.forEach((e: Entity) => {
			player.handleCollision(e);
		});

		return isGrounded;
	}

	public startGameLoop(io: Namespace) {
		this.io = io;

		this.level.reloadLevel();
		this.gameLoop = setInterval(
			async () => {
				this.physicsUpdate();

				const roomData: ServerData = {
					playerData: {},
					entityData: [],
				};

				this.players.forEach((player: Player, id: number) => {
					const pos = player.pos;
					roomData.playerData[id] = {
						nick: player.nick,
						pos: pos,
						velocity: player.velocity,
						isInsideDoor: player.isInsideDoor,
					};
				});

				this.level.entities.forEach((entity: Entity) => {
					const data: ServerEntityData = entity.getData();

					roomData.entityData[entity.id] = data;
				});

				io.to(this.id).emit("tick", roomData);
			},
			(1 / this.TICKRATE) * 1000,
		);
	}

	public changeLevel(level: Level | undefined) {
		this.io?.to(this.id).emit("changeLevel", level?.getID());
		LOG.info(`Room ${this.id} changes level to ${level ? level.getID() : "/GROUP FINNISHED/"}`);

		if (level) {
			LOG.info(`Instance of level ${this.level.getID()} was deleted in room ${this.id}`);
			this.level = level;
			this.level.reloadLevel();
		}
	}

	public stopGameLoop() {
		this.gameLoop?.close();
	}

	public setInputsToPlayer(userID: number, inputs: PlayerInputs) {
		const player = this.players.get(userID);
		if (player === undefined) {
			return;
		}

		player.lastInputs = inputs;
	}

	public getPlayers() {
		return this.players;
	}
}
