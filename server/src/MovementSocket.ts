import { Server } from "socket.io";

export function register(io: Server) {
	const endpoint = io.of("/player");

	endpoint.on("connect", (socket) => {
		console.log(`User of id ${socket.id} connected.`);

		socket.on("disconnect", (e) => {
			console.log(`User of id ${socket.id} disconnected.`);
		});
	});
}

export default { register };
