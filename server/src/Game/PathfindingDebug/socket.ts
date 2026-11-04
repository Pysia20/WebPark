import { DefaultEventsMap, Server, Socket } from "socket.io";

import { LOG } from "../../Logger";

export function register(io: Server) {
	const endpoint = io.of("/debug");

	endpoint.on("connect", (socket) => {
		const roomID: string = socket.handshake.query.roomID as string;
		LOG.debug(`Admin connected with room ${roomID} pathfinding.`);
		socket.join(roomID);

		socket.on("disconnect", (e) => {});
	});

	return endpoint;
}

export default { register };
