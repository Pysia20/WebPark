import { DefaultEventsMap, Server, Socket } from "socket.io";

import { LOG } from "../../Logger";

export function register(io: Server) {
	const endpoint = io.of("/debug");

	endpoint.on("connect", (socket) => {
		socket.on("disconnect", (e) => {});
	});
}

export default { register };
