import { Server } from "socket.io";

import { ClientData } from "../../shared/commonModels";
import map from "../../shared/testMap.json";
import { v4 as uuid } from "uuid";
import { games } from "./Global";
import { RegisterUserData, RegisterUserDataZod } from "./Models";
import { Room } from "./Game/Room";
import { Player } from "./Game/Player";

export function register(io: Server) {
	const endpoint = io.of("/player");

	endpoint.on("connect", (socket) => {
		// console.log(`User of id ${socket.id} connected.`);

		socket.on("registerUser", (data: RegisterUserData, callback) => {
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

			socket.join(data.roomID);
			room.addPlayer(new Player(data.userUUID, data.userNick));
			socket.to(data.roomID).emit("log", `<li>${data.userNick}</li>`);

			socket.data.roomID = data.roomID;
			socket.data.userNick = data.userNick;
			socket.data.userUUID = data.userUUID;

			console.log(`User: ${data.userNick} (${data.userUUID}) joined the room ${data.roomID}`);
		});

		socket.on("playerReady", (uuid) => {
			if (socket.data.roomID) {
				games.get(socket.data.roomID)?.setPlayerReady(uuid, true);

				socket
					.to(socket.data.roomID)
					.emit("log", `<li>User ${socket.data.userNick} is ready.</li>`);
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

		socket.on("disconnect", (e) => {
			console.log(`User of id ${socket.id} disconnected.`);
			console.log(`userNick: ${socket.data.userNick}`);
			console.log(`userUUID: ${socket.data.userUUID}`);
			console.log(`roomID: ${socket.data.roomID}`);

			socket
				.to(socket.data.roomID)
				.emit("log", `User: ${socket.data.userNick} left the room. Bye!`);

			games.get(socket.data.roomID)?.removePlayer(socket.data.userUUID);
		});
	});
}

export default { register };
