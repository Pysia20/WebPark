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
			socket.to(data.roomID).emit("userJoined", data.userNick);

			console.log(`User: ${data.userNick} (${data.userUUID}) joined the room ${data.roomID}`);
		});

		socket.on("disconnect", (e) => {
			// console.log(`User of id ${socket.id} disconnected.`);
		});

		socket.on("tick", (e, callback) => {
			console.log(e);

			callback({
				status: "ok?",
			});
		});
	});
}

export default { register };
