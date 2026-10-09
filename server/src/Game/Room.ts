import { Namespace } from "socket.io";
import { Player } from "./Player";
import { PlayerInputs, ServerData, Vector2, ServerEntityData } from "@shared/commonModels";
import { PLAYER_CONFIG } from "@shared/commonVariables";
import { clamp, isColliding } from "../Global";
import { MAP_LOADER } from "./LevelLoader";
import { MapCollider } from "@shared/commonLevelModels";
import { LOG } from "../Logger";
import { Entity } from "./Entities/Entity";
import { Level } from "./Level";
import e from "cors";

export class Room {
	private TICKRATE: number = 30; // Per second
	private nextUserID: number = 0;

	private id: string;
	private players: Map<number, Player> = new Map<number, Player>();
	public level!: Level;
	private gameLoop: NodeJS.Timeout | undefined;

	constructor(id: string) {
		this.id = id;
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

		this.players.forEach((p) => {
			const spawner = l.spawners[pIndex % l.spawners.length];
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
			const pos: Vector2 = player.pos;
			const velocity: Vector2 = player.velocity;
			const input = player.lastInputs;

			const newPos: Vector2 = { ...pos };
			const newVel: Vector2 = { ...velocity };

			player.isGrounded = false;

			if (newVel.x > PLAYER_CONFIG.DRAG) {
				newVel.x -= PLAYER_CONFIG.DRAG;
			} else if (newVel.x < -PLAYER_CONFIG.DRAG) {
				newVel.x += PLAYER_CONFIG.DRAG;
			} else {
				newVel.x = 0;
			}

			if (!player.isGrounded) {
				newVel.y += PLAYER_CONFIG.GRAVITY;
			}

			newVel.y = clamp(
				newVel.y,
				-PLAYER_CONFIG.MAX_VERTICAL_SPEED,
				PLAYER_CONFIG.MAX_VERTICAL_SPEED,
			);

			newVel.x = clamp(
				newVel.x,
				-PLAYER_CONFIG.MAX_HORIZONTAL_SPEED,
				PLAYER_CONFIG.MAX_HORIZONTAL_SPEED,
			);

			// if (newPos.y >= 720 - PLAYER_CONFIG.HEIGHT && !isJumping) {
			// 	player.setGrounded(true);
			// 	newVel.y = 0;
			// }

			if (this.handleCollisions(player, newPos, newVel)) {
				player.isGrounded = true;
			}

			if (input.right) {
				newVel.x += PLAYER_CONFIG.ACCELERATION;
			}
			if (input.left) {
				newVel.x -= PLAYER_CONFIG.ACCELERATION;
			}

			if (input.jump && player.isGrounded) {
				newVel.y -= PLAYER_CONFIG.JUMP_FORCE;
				player.isGrounded = false;
			}

			newPos.x += newVel.x * (1 / this.TICKRATE);
			newPos.y += newVel.y * (1 / this.TICKRATE);

			newPos.x = clamp(newPos.x, 0, 1280 - PLAYER_CONFIG.WIDTH);
			// newPos.y = clamp(newPos.y, 0, 700 - PLAYER_CONFIG.HEIGHT);

			player.pos = newPos;
			player.velocity = newVel;
		}

		this.level.handleEntites(this);

		this.level.endTick();
	}

	private handleCollisions(player: Player, newPos: Vector2, newVel: Vector2): boolean {
		let isGrounded = false;

		this.players.forEach((p: Player) => {
			if (p.id == player.id) return;

			const { overlapX, overlapY, diffX, diffY } = isColliding(player, p);

			if (overlapX != -1 && overlapY != -1) {
				if (overlapX < overlapY) {
					// Horizontal collison

					if (diffX > 0) {
						// A is going left towards B
						// Pushing out to the right

						if (newVel.x < 0) {
							newPos.x += overlapX;
							newVel.x = 0;
						}
					} else {
						// A is going right towards B
						// Pushing out to the left
						if (newVel.x > 0) {
							newPos.x -= overlapX;
							newVel.x = 0;
						}
					}
				} else {
					// Vertical collision
					if (diffY > 0) {
						// A is going up towards B
						// Pushing out downwards
						if (newVel.y < 0) {
							newPos.y += overlapY;
							newVel.y = 0;
						}
					} else {
						// A is goung down towards B
						// Pushign out upwards

						if (newVel.y > 0) {
							newPos.y -= overlapY;
							newVel.y = 0;
							isGrounded = true;
						}
					}
				}
			} else if (!isGrounded) {
				const collider: MapCollider = new MapCollider(
					newPos.x,
					newPos.y + PLAYER_CONFIG.GROUND_DETECTON_OFFSET,
					PLAYER_CONFIG.WIDTH,
					PLAYER_CONFIG.HEIGHT,
				);

				const { overlapX, overlapY, diffX, diffY } = isColliding(collider, p);

				if (overlapY != -1) {
					isGrounded = true;
					newVel.y = 0;
				}
			}
		});

		this.level.getColliders().forEach((c: MapCollider) => {
			const { overlapX, overlapY, diffX, diffY } = isColliding(player, c);

			if (overlapX != -1 && overlapY != -1) {
				if (overlapX < overlapY) {
					// Horizontal collison

					if (diffX > 0) {
						// A is going left towards B
						// Pushing out to the right

						if (newVel.x < 0) {
							newPos.x += overlapX;
							newVel.x = 0;
						}
					} else {
						// A is going right towards B
						// Pushing out to the left
						if (newVel.x > 0) {
							newPos.x -= overlapX;
							newVel.x = 0;
						}
					}
				} else {
					// Vertical collision
					if (diffY > 0) {
						// A is going up towards B
						// Pushing out downwards
						if (newVel.y < 0) {
							newPos.y += overlapY;
							newVel.y = 0;
						}
					} else {
						// A is goung down towards B
						// Pushign out upwards

						if (newVel.y > 0) {
							newPos.y -= overlapY;
							newVel.y = 0;
							isGrounded = true;
						}
					}
				}
			} else if (!isGrounded) {
				const collider: MapCollider = new MapCollider(
					newPos.x,
					newPos.y + PLAYER_CONFIG.GROUND_DETECTON_OFFSET,
					PLAYER_CONFIG.WIDTH,
					PLAYER_CONFIG.HEIGHT,
				);

				const { overlapX, overlapY, diffX, diffY } = isColliding(collider, c);

				if (overlapY != -1) {
					isGrounded = true;
					newVel.y = 0;
				}
			}
		});

		this.level.entities.forEach((e: Entity) => {
			if (e.handleCollisions(player, newPos, newVel, isGrounded)) {
				isGrounded = true;
			}
		});

		return isGrounded;
	}

	public startGameLoop(io: Namespace) {
		this.level = MAP_LOADER.GetLevel("Level_0", this);
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
