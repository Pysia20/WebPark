import { Namespace } from "socket.io";
import { Player } from "./Player";
import { PlayerInputs, Vector2 } from "../../../shared/commonModels";
import { PLAYER_CONFIG } from "../../../shared/commonVariables";
import { clamp } from "../Global";
import { emitInputs } from "../../../client/src/Network";

export class Room {
	private TICKRATE: number = 30; // Per second
	private nextUserID: number = 0;

	private id: string;
	private players: Map<number, Player> = new Map<number, Player>();
	private inputs: PlayerInputs[] = [];
	private map: undefined;
	private gameLoop: NodeJS.Timeout | undefined;

	constructor(id: string) {
		this.id = id;
	}

	public getID(): string | undefined {
		return this.id;
	}

	public addPlayer(p: Player) {
		p.setPos({ x: p.getID() * 400, y: 0 });
		this.players.set(p.getID(), p);
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
			if (!player.getIsReady()) {
				isReady = false;
			}
		});

		return isReady;
	}

	public setPlayerReady(id: number, v: boolean) {
		this.players.get(id)?.setIsReady(v);
	}

	private physicsUpdate() {
		for (let [id, player] of this.players) {
			const pos: Vector2 = player.getPos();
			const velocity: Vector2 = player.getVelocity();
			const input = player.getInputs();

			const newPos: Vector2 = { ...pos };
			const newVel: Vector2 = { ...velocity };

			let isJumping = false;

			if (input.right) {
				newVel.x += PLAYER_CONFIG.ACCELERATION;
			}
			if (input.left) {
				newVel.x -= PLAYER_CONFIG.ACCELERATION;
			}
			if (input.jump && player.getGrounded()) {
				newVel.y -= PLAYER_CONFIG.JUMP_FORCE;
				player.setGrounded(false);
				isJumping = true;
			}

			if (newVel.x > PLAYER_CONFIG.DRAG) {
				newVel.x -= PLAYER_CONFIG.DRAG;
			} else if (newVel.x < -PLAYER_CONFIG.DRAG) {
				newVel.x += PLAYER_CONFIG.DRAG;
			} else {
				newVel.x = 0;
			}

			newVel.y += PLAYER_CONFIG.GRAVITY;

			if (this.handleCollisions(player, newPos, newVel)) {
				player.setGrounded(true);
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

			if (newPos.y >= 720 - PLAYER_CONFIG.HEIGHT && !isJumping) {
				player.setGrounded(true);
				newVel.y = 0;
			}

			newPos.x += newVel.x * (1 / this.TICKRATE);
			newPos.y += newVel.y * (1 / this.TICKRATE);

			newPos.x = clamp(newPos.x, 0, 1280 - PLAYER_CONFIG.WIDTH);
			newPos.y = clamp(newPos.y, 0, 720 - PLAYER_CONFIG.HEIGHT);

			player.setPos(newPos);
			player.setVelocity(newVel);
		}
	}

	private handleCollisions(player: Player, newPos: Vector2, newVel: Vector2): boolean {
		const playerWidth = PLAYER_CONFIG.WIDTH;
		const playerHeight = PLAYER_CONFIG.HEIGHT;

		let changeGrounded = false;

		this.players.forEach((p: Player) => {
			if (p.getID() == player.getID()) return;

			const otherPos = p.getPos();
			const otherVel = p.getVelocity();

			const isCollidingX =
				otherPos.x < newPos.x + playerWidth && newPos.x < otherPos.x + playerWidth;

			const isCollidingY =
				newPos.y + playerHeight > otherPos.y && newPos.y < otherPos.y + playerHeight;

			if (!isCollidingX || !isCollidingY) return; // Players arent colliding

			const centerA: Vector2 = {
				x: newPos.x + playerWidth / 2,
				y: newPos.y + playerHeight / 2,
			};

			const centerB: Vector2 = {
				x: otherPos.x + playerWidth / 2,
				y: otherPos.y + playerHeight / 2,
			};

			const diffX = centerA.x - centerB.x;
			const diffY = centerA.y - centerB.y;

			const overlapX = playerWidth - Math.abs(diffX);
			const overlapY = playerHeight - Math.abs(diffY);

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
					const pos = player.getPos();
					roomData.playerData[id] = {
						nick: player.getNick(),
						pos: pos,
						velocity: player.getVelocity(),
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

		player.setInputs(inputs);
	}

	public getPlayers() {
		return this.players;
	}
}
