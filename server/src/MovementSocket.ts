import { Server } from "socket.io";
import { ClientData } from "../../shared/commonModels";
import map from "../../shared/testMap.json";

export function register(io: Server) {
	const endpoint = io.of("/player");

	endpoint.on("connect", (socket) => {
		console.log(`User of id ${socket.id} connected.`);

		socket.on("createRoom", (e) => {});

		socket.on("joinRoom", (e) => {
			const roomName: string = "room";

			socket.join(roomName);
			socket.to(roomName).emit("roomInfo", `User of id: ${socket.id} joined the room.`);
		});

		socket.on("disconnect", (e) => {
			console.log(`User of id ${socket.id} disconnected.`);
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
