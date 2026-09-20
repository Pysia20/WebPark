import { Namespace } from "socket.io";
import { Player } from "./Player";
import { PlayerInputs, Vector2 } from "../../../shared/commonModels";
import { PLAYER_CONFIG } from "../../../shared/commonVariables";
import { clamp } from "../Global";

export class Room {
	private TICKRATE: number = 30; // Per second

	private id: string;
	private players: Map<string, Player> = new Map<string, Player>();
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
		this.players.set(p.getID(), p);
	}

	public removePlayer(uuid: string) {
		this.players.delete(uuid);
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

	public setPlayerReady(uuid: string, v: boolean) {
		this.players.get(uuid)?.setIsReady(v);
	}

	private physicsUpdate() {
		for (let [uuid, player] of this.players) {
			const pos: Vector2 = player.getPos();
			const velocity: Vector2 = player.getVelocity();
			const input = player.getInputs();

			const newPos: Vector2 = { ...pos };
			const newVel: Vector2 = { ...velocity };

			//TODO: When player spams a key then it accelerates

			if (input.right) {
				newVel.x += PLAYER_CONFIG.ACCELERATION;
			}
			if (input.left) {
				newVel.x -= PLAYER_CONFIG.ACCELERATION;
			}

			//TODO: Drag doesnt work
			if (newVel.x > PLAYER_CONFIG.DRAG) {
				newVel.x -= PLAYER_CONFIG.DRAG;
			} else if (newVel.x < -PLAYER_CONFIG.DRAG) {
				newVel.x += PLAYER_CONFIG.DRAG;
			} else {
				newVel.x = 0;
			}

			newVel.x = clamp(
				newVel.x,
				-PLAYER_CONFIG.MAX_HORIZONTAL_SPEED,
				PLAYER_CONFIG.MAX_HORIZONTAL_SPEED,
			);

			newPos.x += newVel.x * (1 / this.TICKRATE);
			newPos.y += newVel.y * (1 / this.TICKRATE);

			newPos.x = clamp(newPos.x, 0, 300);
			newPos.y = clamp(newPos.y, 0, 300);

			player.setPos(newPos);
			player.setVelocity(newVel);
		}
	}

	public startGameLoop(io: Namespace) {
		this.gameLoop = setInterval(
			async () => {
				this.physicsUpdate();

				const roomData = {
					players: {} as Record<string, any>,
				};

				this.players.forEach((player: Player, uuid: string) => {
					const pos = player.getPos();
					roomData.players[uuid] = {
						nick: player.getNick(),
						pos: pos,
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

	public setInputsToPlayer(userUUID: string, inputs: PlayerInputs) {
		const player = this.players.get(userUUID);
		if (player === undefined) {
			return;
		}

		player.setInputs(inputs);
	}
}
