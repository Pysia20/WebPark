import { Server } from "socket.io";

export function register(io: Server) {
	const endpoint = io.of("/move");

	endpoint.on("connection", (socket) => {
		console.log("User connected");
		endpoint.emit("Hiiiii");
	});
}

export default { register };
