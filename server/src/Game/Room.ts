import { Namespace } from "socket.io";
import { Player } from "./Player";
import { PlayerInputs, Vector2 } from "@shared/commonModels";
import { PLAYER_CONFIG } from "@shared/commonVariables";
import { clamp, isColliding } from "../Global";
import { LevelMap as GameMap } from "./LevelMap";
import { MAP_LOADER } from "./MapLoader";
import { MapCollider } from "@shared/commonMapModels";
import { LOG } from "../Logger";
import { Entity } from "./Entities/Entity";

export class Room {
	private TICKRATE: number = 30; // Per second
	private nextUserID: number = 0;

	private id: string;
	private players: Map<number, Player> = new Map<number, Player>();
	private inputs: PlayerInputs[] = [];
	public map: GameMap;
	private gameLoop: NodeJS.Timeout | undefined;

	constructor(id: string) {
		this.id = id;
		this.map = MAP_LOADER.LoadMap("Level_0");
		console.log(this.map.colliders.length);
	}

	public getID(): string | undefined {
		return this.id;
	}

	public addPlayer(p: Player) {
		p.pos = { x: p.id * 400, y: 0 };
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

	private physicsUpdate() {
		for (let [id, player] of this.players) {
			const pos: Vector2 = player.pos;
			const velocity: Vector2 = player.velocity;
			const input = player.lastInputs;

			const newPos: Vector2 = { ...pos };
			const newVel: Vector2 = { ...velocity };

			let isJumping = false;

			player.isGrounded = false;

			if (newVel.x > PLAYER_CONFIG.DRAG) {
				newVel.x -= PLAYER_CONFIG.DRAG;
			} else if (newVel.x < -PLAYER_CONFIG.DRAG) {
				newVel.x += PLAYER_CONFIG.DRAG;
			} else {
				newVel.x = 0;
			}

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
				isJumping = true;
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

			newPos.x += newVel.x * (1 / this.TICKRATE);
			newPos.y += newVel.y * (1 / this.TICKRATE);

			newPos.x = clamp(newPos.x, 0, 1280 - PLAYER_CONFIG.WIDTH);
			// newPos.y = clamp(newPos.y, 0, 700 - PLAYER_CONFIG.HEIGHT);

			player.pos = newPos;
			player.velocity = newVel;
		}
	}

	private handleCollisions(player: Player, newPos: Vector2, newVel: Vector2): boolean {
		const playerWidth = PLAYER_CONFIG.WIDTH;
		const playerHeight = PLAYER_CONFIG.HEIGHT;

		let changeGrounded = false;

		this.players.forEach((p: Player) => {
			if (p.id == player.id) return;

			const { overlapX, overlapY, diffX, diffY } = isColliding(player, p);

			if (overlapX == -1 || overlapY == -1) return;

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
						changeGrounded = true;
					}
				}
			}
		});

		this.map.colliders.forEach((c: MapCollider) => {
			const { overlapX, overlapY, diffX, diffY } = isColliding(player, c);

			if (overlapX == -1 || overlapY == -1) return;

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
						changeGrounded = true;
					}
				}
			}
		});

		this.map.entities.forEach((e: Entity) => {
			if (e.handleCollisions(player, newPos, newVel)) changeGrounded = true;
		});

		return changeGrounded;
	}

	public startGameLoop(io: Namespace) {
		this.gameLoop = setInterval(
			async () => {
				this.physicsUpdate();

				const roomData = {
					playerData: {} as Record<string, any>,
				};

				this.players.forEach((player: Player, id: number) => {
					const pos = player.pos;
					roomData.playerData[id] = {
						nick: player.nick,
						pos: pos,
						velocity: player.velocity,
					};
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
