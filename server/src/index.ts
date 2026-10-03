import Express from "express";
import { Express as ExpressInterface, Request, Response } from "express";
import { Server, createServer } from "http";
import { DefaultEventsMap, Server as SocketIOServer } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { z } from "zod";

import { games, generateRoomCode } from "./Global";
import config from "../config.json";
import movement from "./MovementSocket";
import { Room } from "./Game/Room";
import { Player } from "./Game/Player";
import { JoinRoomRequest, JoinRoomRequestZod, SocketData } from "./Models";
import { LOG } from "./Logger";
import { ROOM_CONFIG } from "../../shared/commonVariables";

const app: ExpressInterface = Express();
const server: Server = createServer(app);
const io: SocketIOServer = new SocketIOServer<
	DefaultEventsMap,
	DefaultEventsMap,
	DefaultEventsMap,
	SocketData
>(server, {
	path: "/api/socket.io",
	cors: {
		origin: ["http://localhost:5173", "https://webpark.mywire.org", "webpark.dino.icu"],
		methods: ["GET", "POST"],
		credentials: true,
	},
});

movement.register(io);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_PATH = path.join(__dirname, "..", "public");
const SHARED_PATH = path.join(PUBLIC_PATH, "..", "..", "shared");

app.use(cors());
app.use(Express.json());
app.use("/api/", Express.static(PUBLIC_PATH));
app.use("/shared", Express.static(SHARED_PATH));

//TODO Request validation

app.get("/api/ping", (req: Request, res: Response) => {
	res.status(200).json({ pong: true });
});

app.post("/api/createRoom", (req: Request, res: Response) => {
	const roomID = generateRoomCode();

	const room = new Room(roomID);
	games.set(roomID, room);

	const userID = room.getNextUserID();

	LOG.info(`ENDPOINT: createRoom | User created a room (${roomID}).`);

	res.status(200).json({
		roomID: roomID,
		userID: userID,
	});
});

app.get("/api/joinRoom/:id", (req: Request, res: Response) => {
	const id = req.params["id"];

	try {
		z.string().length(6).parse(id);
	} catch (e) {
		if (e instanceof Error) {
			LOG.warn(`ENDPOINT: joinRoom | Invalid room id (${id}).`);
			res.status(400).json({
				status: "error",
				message: e.message,
			});
		} else {
			console.error(e);
		}
		return;
	}

	const room = games.get(String(id));
	if (room?.getPlayers().size! >= ROOM_CONFIG.MAX_PLAYERS) {
		LOG.warn(`Additional player tried to join room ${id}.`);
		res.status(400).json({
			status: "error",
			message: "Too many players in this lobby.",
		});
		return;
	}

	const userID = room?.getNextUserID();

	LOG.info(`ENDPOINT: joinRoom | Player (${userID}) joined a room (${id})`);

	res.status(200).json({
		roomID: id,
		userID: userID,
	});
});

app.get("/api/game/:id", (req: Request, res: Response) => {
	res.status(200).sendFile(path.join(__dirname, "../public/game.html"));
});

server.listen(config.PORT, () => {
	LOG.info(`Server running on http://localhost:${config.PORT}`);
	LOG.info(`Nginx on: https://localhost`);
});
