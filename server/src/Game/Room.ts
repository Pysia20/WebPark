import { Namespace } from "socket.io";
import { Player } from "./Player";
import {
	PlayerInputs,
	ServerData,
	ServerEntityData,
	SomethingBrokeData,
} from "@shared/commonModels";
import { PLAYER_CONFIG } from "@shared/commonVariables";
import { MAP_LOADER } from "./LevelLoader";
import { LOG } from "../Logger";
import { Level } from "./Level";
import CONFIG from "../../config.json";
import { PlayerSpawner } from "./Entities/PlayerSpawner";
import { Entity } from "./Entity";
import { PathfindingDebug } from "./PathfindingDebug";
import { conn } from "../DB";

export class Room {
	public readonly TICKRATE: number = CONFIG.TICKRATE; // Per second
	private nextUserID: number = 0;

	private id: string;
	public players: Map<number, Player> = new Map<number, Player>();
	public level: Level;
	private gameLoop: NodeJS.Timeout | undefined;

	private levelStart: number = -1;

	public io: Namespace | undefined;

	constructor(id: string) {
		this.id = id;

		this.level = MAP_LOADER.GetLevel("Level_0", this);

		if (PathfindingDebug) {
			PathfindingDebug.registerGrid(this.id, this.level.grid, this.level);
		}
	}

	public getID(): string | undefined {
		return this.id;
	}

	public addPlayer(p: Player) {
		this.players.set(p.playerID, p);
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

		this.players.forEach((p, id) => {
			p.isInsideDoor = false;
			const spawnerIndex = pIndex % l.spawners.length;

			const spawner: PlayerSpawner = l.spawners[spawnerIndex];
			const newPos = { ...spawner.pos };

			newPos.y -=
				PLAYER_CONFIG.HEIGHT / 4 +
				PLAYER_CONFIG.HEIGHT * 1.2 * ((pIndex - spawnerIndex) / l.spawners.length);

			p.pos = { ...newPos };
			p.velocity = { x: 0, y: 0 };
			p.isGrounded = false;

			pIndex++;
		});
	}

	public startGameLoop(io: Namespace) {
		try {
			this.level = this.level.reloadLevel();
			this.levelStart = new Date().getTime();

			this.gameLoop = setInterval(
				async () => {
					if (this.players.size <= 0) return;

					this.level.physicsUpdate();

					const roomData: ServerData = {
						playerData: {},
						entityData: {},
					};

					this.players.forEach((player: Player, id: number) => {
						const pos = player.pos;
						roomData.playerData[id] = {
							nick: player.nick,
							pos: pos,
							velocity: player.velocity,
							isInsideDoor: player.isInsideDoor,
							isPushing: player.isPushing,
							cursorPos: player.currentInputs.cursorPos,
						};
					});

					this.level.entities.forEach((entity: Entity) => {
						if (entity.type == "Player" || entity.type == "MapCollider") return;

						const data: ServerEntityData = entity.getData();

						roomData.entityData[entity.id] = data;
					});

					// console.log("=============");
					// console.log(roomData);
					// console.log("=============");

					io.to(this.id).emit("tick", roomData);
				},
				(1 / this.TICKRATE) * 1000,
			);
		} catch (e: any) {
			if (e instanceof Error) {
				LOG.error(e);
				io.to(this.id).emit("somethingBroke", {
					name: "Error",
					eventName: "Gameloop",
					message: e.message,
				} as SomethingBrokeData);
			} else {
				LOG.error(e);
				io.to(this.id).emit("somethingBroke", {
					name: "Error",
					eventName: "Gameloop",
					message: "Unknown error, check server console.",
				} as SomethingBrokeData);
			}
		}
	}

	public async handleSaveToLeaderboard() {
		if (this.levelStart != -1) {
			const timeSpent = new Date().getTime() - this.levelStart;
			let usernames = "";

			for (const [_, player] of this.players) {
				usernames += player.nick + ";";
			}

			usernames = usernames.substring(0, usernames.length - 1);

			const level = this.level.getID();

			this.levelStart = -1;
			const sql = `INSERT INTO Leaderboard(level, players, time) VALUES (?,?,?)`;

			await conn.query(sql, [level, usernames, timeSpent]);
		}
	}

	public changeLevel(level: Level | undefined) {
		if (this.players.size <= 0) return;

		this.handleSaveToLeaderboard();

		this.io!.to(this.id).emit("changeLevel", level?.getID());
		LOG.info(`Room ${this.id} changes level to ${level ? level.getID() : "/GROUP FINNISHED/"}`);

		if (level) {
			LOG.info(`Instance of level ${this.level.getID()} was deleted in room ${this.id}`);
			this.level = level;
			this.level.reloadLevel();

			if (PathfindingDebug) {
				PathfindingDebug.unregisterGrid(this.id);
			}

			if (PathfindingDebug) {
				PathfindingDebug.registerGrid(this.id, this.level.grid, this.level);
			}
		} else {
			this.stopGameLoop();
		}
	}

	public sendLevelReloaded() {
		this.io?.to(this.id).emit("levelReloaded");
	}

	public stopGameLoop() {
		if (PathfindingDebug) {
			PathfindingDebug.unregisterGrid(this.id);
		}
		this.gameLoop?.close();
		this.io?.to(this.id).emit("levelGroupFinnished");
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
