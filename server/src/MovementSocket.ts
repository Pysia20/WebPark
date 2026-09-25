import { DefaultEventsMap, Server, Socket } from "socket.io";

import {
	ClientData,
	PlayerInputs,
	PlayerJoinedData,
	RegisterUserData,
	RegisterUserDataZod,
	SomethingBrokeData,
} from "../../shared/commonModels";
import map from "../../shared/testMap.json";
import { games } from "./Global";
import { InputsZod, SocketData, SocketDataZod } from "./Models";
import { Room } from "./Game/Room";
import { Player } from "./Game/Player";
import e from "cors";

type PlayerSocket = Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>;

export function register(io: Server) {
	const endpoint = io.of("/player");

	endpoint.on("connect", (socket: PlayerSocket) => {
		console.log(`User of id ${socket.id} connected.`);

		socket.data.roomID = undefined;
		socket.data.userID = undefined;
		socket.data.userNick = undefined;

		socket.on("registerUser", async (data: RegisterUserData, callback) => {
			console.log(data);

			try {
				RegisterUserDataZod.parse(data);
			} catch (e) {
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
				socket.emit("somethingBroke", {
					name: "Error",
					message: "Room (roomID) doesn't exist.",
					eventName: "registerUser",
				} as SomethingBrokeData);
				return;
			}

			await socket.join(data.roomID);

			const player: Player = new Player(data.userID, data.userNick);
			player.setColor(data.color);

			room.addPlayer(player);

			socket.to(data.roomID).emit("log", `<li>${data.userNick} joined the room </li>`);
			//TODO Color emit playerJoined

			const playerJoinedData: PlayerJoinedData[] = [];

			games
				.get(data.roomID)
				?.getPlayers()
				.forEach((player, id) => {
					const data: PlayerJoinedData = {
						playerID: player.getID(),
						nick: player.getNick(),
						color: player.getColor(),
					};

					playerJoinedData.push(data);
				});

			endpoint.to(data.roomID).emit("playerJoined", playerJoinedData);

			socket.data.roomID = data.roomID;
			socket.data.userNick = data.userNick;
			socket.data.userID = data.userID;

			console.log(`User: ${data.userNick} (${data.userID}) joined the room ${data.roomID}`);
		});

		socket.on("playerReady", (id: number) => {
			if (socket.data.roomID) {
				const room: Room | undefined = games.get(socket.data.roomID);

				if (room === undefined) {
					socket.emit("somethingBroke", {
						name: "Error",
						message: "Room (roomID) doesn't exist.",
						eventName: "registerUser",
					} as SomethingBrokeData);

					return;
				} else {
					console.error(e);
				}

				room.setPlayerReady(id, true);

				socket
					.to(socket.data.roomID)
					.emit("log", `<li>User ${socket.data.userNick} is ready.</li>`);

				if (room.isEveryoneReady()) {
					console.log("starting");
					room.startGameLoop(endpoint);
				}
			}
		});

		socket.on("playerUnReady", (id) => {
			if (socket.data.roomID) {
				games.get(socket.data.roomID)?.setPlayerReady(id, false);

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
			console.log(`User of id ${socket.id} disconnected.`);
			console.log(`userNick: ${socket.data.userNick}`);
			console.log(`userID: ${socket.data.userID}`);
			console.log(`roomID: ${socket.data.roomID}`);

			socket
				.to(socket.data.roomID!)
				.emit("log", `User: ${socket.data.userNick} left the room. Bye!`);

			games.get(socket.data.roomID!)?.removePlayer(socket.data.userID!);
		});
	});
}

export default { register };
