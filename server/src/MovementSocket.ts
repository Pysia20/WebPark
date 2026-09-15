import { Server } from "socket.io";
import { ClientData } from "../../shared/commonModels";

export function register(io: Server) {
	const endpoint = io.of("/player");

	endpoint.on("connect", (socket) => {
		console.log(`User of id ${socket.id} connected.`);

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
