import { DefaultEventsMap, Server, Socket } from "socket.io";

import {
	ClientData,
	PlayerInputs,
	PlayerJoinedData,
	RegisterUserData,
	RegisterUserDataZod,
	SomethingBrokeData,
} from "@shared/commonModels";
import { games } from "./Global";
import { InputsZod, SocketData, SocketDataZod } from "./Models";
import { Room } from "./Game/Room";
import { Player } from "./Game/Player";
import { LOG } from "./Logger";

type PlayerSocket = Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>;

export function register(io: Server) {
	const endpoint = io.of("/player");

	endpoint.on("connect", (socket: PlayerSocket) => {
		LOG.info(`SOCKET | User (${socket.id}) connected.`);

		socket.on("registerUser", async (data: RegisterUserData, callback) => {
			try {
				RegisterUserDataZod.parse(data);
			} catch (e) {
				LOG.warn(`SOCKET: registerUser | Invalid request body.`);
				if (e instanceof Error) {
					socket.emit("somethingBroke", {
						name: e.name,
						message: e.message,
						eventName: "registerUser",
					} as SomethingBrokeData);
				} else {
					console.error(e);
				}

				return;
			}

			const room: Room | undefined = games.get(data.roomID);

			if (room === undefined) {
				LOG.warn(`SOCKET: registerUser | Room (${data.roomID}) doesn't exist.`);
				socket.emit("somethingBroke", {
					name: "Error",
					message: "Room (roomID) doesn't exist.",
					eventName: "registerUser",
				} as SomethingBrokeData);
				return;
			}

			await socket.join(data.roomID);

			const player: Player = new Player(data.userID, data.userNick);
			player.color = data.color;

			room.addPlayer(player);

			socket.to(data.roomID).emit("log", `<li>${data.userNick} joined the room </li>`);
			//TODO Color emit playerJoined

			const playerJoinedData: PlayerJoinedData[] = [];

			games
				.get(data.roomID)
				?.getPlayers()
				.forEach((player, id) => {
					const data: PlayerJoinedData = {
						playerID: player.id,
						nick: player.nick,
						color: player.color,
					};

					playerJoinedData.push(data);
				});

			endpoint.to(data.roomID).emit("playerJoined", playerJoinedData);

			socket.data.roomID = data.roomID;
			socket.data.userNick = data.userNick;
			socket.data.userID = data.userID;

			LOG.info(`User: ${data.userNick} (${data.userID}) joined the room (${data.roomID})`);
		});

		socket.on("playerReady", (id: number) => {
			if (socket.data.roomID) {
				const room: Room | undefined = games.get(socket.data.roomID);

				if (room === undefined) {
					LOG.warn(`SOCKET: playerReady | Room (${socket.data.roomID}) doesn't exist.`);
					socket.emit("somethingBroke", {
						name: "Error",
						message: "Room (roomID) doesn't exist.",
						eventName: "playerReady",
					} as SomethingBrokeData);

					return;
				}

				room.setPlayerReady(id, true);

				let readyCount = 0;

				room.getPlayers().forEach((p) => {
					if (p.isReady) readyCount++;
				});

				endpoint.to(socket.data.roomID).emit("readyUpdate", readyCount);

				socket
					.to(socket.data.roomID)
					.emit("log", `<li>User ${socket.data.userNick} is ready.</li>`);

				if (room.isEveryoneReady()) {
					LOG.info(`SOCKET: playerReady | Room (${socket.data.roomID}) started.`);
					room.startGameLoop(endpoint);
				}
			}
		});

		socket.on("playerUnReady", (id) => {
			if (socket.data.roomID) {
				const room: Room | undefined = games.get(socket.data.roomID);

				if (room === undefined) {
					LOG.warn(`SOCKET: playerUnReady | Room (${socket.data.roomID}) doesn't exist.`);
					socket.emit("somethingBroke", {
						name: "Error",
						message: "Room (roomID) doesn't exist.",
						eventName: "playerUnReady",
					} as SomethingBrokeData);

					return;
				}

				room.setPlayerReady(id, false);

				let readyCount = 0;

				room.getPlayers().forEach((p) => {
					if (p.isReady) readyCount++;
				});

				endpoint.to(socket.data.roomID).emit("readyUpdate", readyCount);

				socket
					.to(socket.data.roomID)
					.emit("log", `<li>User ${socket.data.userNick} stopped being ready.</li>`);
			}
		});

		socket.on("playerInputs", (inputs: PlayerInputs) => {
			try {
				InputsZod.parse(inputs);
			} catch (e) {
				if (e instanceof Error) {
					LOG.warn(
						`SOCKET: playerInputs | Player (${socket.data.userID}) sent invalid inputs.`,
					);
					socket.emit("somethingBroke", {
						name: e.name,
						message: e.message,
						eventName: "playerInputs",
					} as SomethingBrokeData);
				} else {
					console.error(e);
				}

				return;
			}

			try {
				SocketDataZod.parse(socket.data);
			} catch (e) {
				LOG.warn(`SOCKET: playerInputs | Player's socket data doesn't exist.`);
				if (e instanceof Error) {
					socket.emit("somethingBroke", {
						name: e.name,
						message: e.message,
						eventName: "playerInputs",
					} as SomethingBrokeData);
				} else {
					console.error(e);
				}

				return;
			}

			games.get(socket.data.roomID!)?.setInputsToPlayer(socket.data.userID!, inputs);
		});

		socket.on("disconnect", (e) => {
			// console.log(`User of id ${socket.id} disconnected.`);
			// console.log(`userNick: ${socket.data.userNick}`);
			// console.log(`userID: ${socket.data.userID}`);
			// console.log(`roomID: ${socket.data.roomID}`);

			LOG.info(`SOCKET | User (${socket.id}) disconnected.`);

			socket
				.to(socket.data.roomID!)
				.emit("log", `User: ${socket.data.userNick} left the room. Bye!`);

			games.get(socket.data.roomID!)?.removePlayer(socket.data.userID!);

			socket.to(socket.data.roomID!).emit("playerLeft", socket.data.userID);
		});
	});
}

export default { register };
