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

			this.handleCollisions(player, newPos, newVel);

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

	private handleCollisions(player: Player, newPos: Vector2, newVel: Vector2) {
		this.players.forEach((p: Player) => {
			if (p.getID() == player.getID()) return;

			// Main player collider box
			const A1: Vector2 = player.getPos(); // Top left
			const A2: Vector2 = { x: A1.x + PLAYER_CONFIG.WIDTH, y: A1.y }; // Top right
			const A3: Vector2 = { x: A1.x, y: A1.y + PLAYER_CONFIG.HEIGHT }; // Bottom left
			const A4: Vector2 = { x: A1.x + PLAYER_CONFIG.WIDTH, y: A1.y + PLAYER_CONFIG.HEIGHT }; // Bottom right
			const A: Vector2[] = [A1, A2, A3, A4];

			// Other player collider box
			const B1: Vector2 = p.getPos(); // Top left
			const B2: Vector2 = { x: B1.x + PLAYER_CONFIG.WIDTH, y: B1.y }; // Top right
			const B3: Vector2 = { x: B1.x, y: B1.y + PLAYER_CONFIG.HEIGHT }; // Bottom left
			const B4: Vector2 = { x: B1.x + PLAYER_CONFIG.WIDTH, y: B1.y + PLAYER_CONFIG.HEIGHT }; // Bottom right
			const B: Vector2[] = [B1, B2, B3, B4];

			if (!(A2.x > B1.x && A1.x < B2.x && A3.y > B1.y && A1.y < B3.y)) return; // Players don't collide -> Exit

			// Geting the closes corners
			let shortestDistanceSquared: number = Infinity;
			let shortestA: Vector2;
			let shortestB: Vector2;

			A.forEach((vA, i) => {
				B.forEach((vB, j) => {
					const distance = (vA.x - vB.x) ** 2 + (vA.y - vB.y) ** 2; // It is squared (cuz if a^2 > b^2 -> a > b, so anyway it will find the shortest)

					if (distance < shortestDistanceSquared) {
						shortestDistanceSquared = distance;
						shortestA = vA;
						shortestB = vB;
						// console.log(i, j);
					}
				});
			});

			/**
			 * **A** is the colliding object.
			 *
			 * **B** is a static object.
			 *
			 * Collision type is which side of **B** is **A** touching.
			 * When collision type is "Right" it means that:
			 *- **A** needs to be moved to the right
			 *- **LEFT** side of **A** is touching the **RIGHT** side of **B**
			 *
			 * **Perfect** is a situation in which **A** lands perfectly on **B**'s corner
			 */

			// Relative possition are diffrent
			// A on the left
			// B on the right
			// A going right -> AX = 0.1666666, BX = 0.33333
			// B going left -> AX = BX = 0.1666666

			const relativeAX = shortestA!.x - shortestB!.x;
			const relativeAY = shortestB!.y - shortestA!.y;

			const modX = Math.abs(relativeAX);
			const modY = Math.abs(relativeAY);

			if (modX < modY) {
				console.log("Vertical wooooo");
				// // Vertical-type collision (Top / Bottom)
			}
			if (modX > modY) {
				// Horizontal-type collision (Right / Left)

				if (
					p.getVelocity().x > -player.getVelocity().x ||
					-p.getVelocity().x > player.getVelocity().x
				)
					newVel.x = 0;
				newPos.x -= relativeAX;
			}
			if (modX == modY) {
				// Corners are perfectly aligned.
				// Kinda like that DVD logo bouncing around the screen,
				// when it touches the corner
				// console.log(`Collision for ${player.getNick()} | Perfect`);
			}
		});
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
