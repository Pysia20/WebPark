import { DefaultEventsMap, Server, Socket } from "socket.io";

import {
	ClientData,
	PlayerInputs,
	PlayerJoinedData,
	RegisterUserData,
	RegisterUserDataZod,
} from "../../shared/commonModels";
import map from "../../shared/testMap.json";
import { games } from "./Global";
import { InputsZod, SocketData, SocketDataZod } from "./Models";
import { Room } from "./Game/Room";
import { Player } from "./Game/Player";

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
				callback({
					status: "error",
					message: "Provided data is incorrectly formatted",
				});
				return;
			}

			const room: Room | undefined = games.get(data.roomID);

			if (room === undefined) {
				callback({
					status: "error",
					message: "Room doesn't exist",
				});
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
				.forEach((player, uuid) => {
					const data: PlayerJoinedData = {
						playerID: player.getID(),
						nick: player.getNick(),
						color: player.getColor(),
					};

					playerJoinedData.push(data);
				});

			socket.to(data.roomID).emit("playerJoined", playerJoinedData);

			socket.data.roomID = data.roomID;
			socket.data.userNick = data.userNick;
			socket.data.userID = data.userID;

			console.log(`User: ${data.userNick} (${data.userID}) joined the room ${data.roomID}`);
		});

		socket.on("playerReady", (uuid) => {
			if (socket.data.roomID) {
				const room: Room | undefined = games.get(socket.data.roomID);

				if (room === undefined) return;

				room.setPlayerReady(uuid, true);

				socket
					.to(socket.data.roomID)
					.emit("log", `<li>User ${socket.data.userNick} is ready.</li>`);

				if (room.isEveryoneReady()) {
					console.log("starting");
					room.startGameLoop(endpoint);
				}
			}
		});

		socket.on("playerUnReady", (uuid) => {
			if (socket.data.roomID) {
				games.get(socket.data.roomID)?.setPlayerReady(uuid, false);

				socket
					.to(socket.data.roomID)
					.emit("log", `<li>User ${socket.data.userNick} stopped being ready.</li>`);
			}
		});

		socket.on("playerInputs", (inputs: PlayerInputs) => {
			try {
				InputsZod.parse(inputs);
			} catch {
				console.log("Invalid inputs request.", inputs);
				throw Error("Invalid inputs request.");
			}

			try {
				SocketDataZod.parse(socket.data);
			} catch {
				console.log("Invalid socket data, try reconecting.", socket.data);
				throw Error("Invalid socket data, try reconecting.");
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
