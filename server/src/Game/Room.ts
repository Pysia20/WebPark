import { Namespace } from "socket.io";
import { Player } from "./Player";
import { PlayerInputs, Vector2 } from "../../../shared/commonModels";

export class Room {
	private TICKRATE: number = 20; // Per second

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
		this.players.forEach((player) => {
			if (!player.getIsReady()) {
				return false;
			}
		});

		return true;
	}

	public setPlayerReady(uuid: string, v: boolean) {
		this.players.get(uuid)?.setIsReady(v);
	}

	public startGameLoop(io: Namespace) {
		this.gameLoop = setInterval(
			async () => {
				const roomData = {
					players: {} as Record<string, any>,
				};

				this.players.forEach((player: Player, uuid: string) => {
					const pos = player.getPos();
					roomData.players[uuid] = {
						pos: pos,
					};
				});

				io.to(this.id).emit("tick");
			},
			(1 / this.TICKRATE) * 1000,
		);
	}

	public stopGameLoop() {
		this.gameLoop?.close();
	}

	private physicsUpdate() {
		this.inputs.forEach((input: PlayerInputs) => {});
	}

	public addInputsToStack(userUUID: string, inputs: PlayerInputs) {
		if (inputs.userUUID !== userUUID) {
			return;
		}

		this.inputs.push(inputs);
	}
}
