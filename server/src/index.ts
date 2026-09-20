import Express from "express";
import { Express as ExpressInterface, Request, Response } from "express";
import { Server, createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuid } from "uuid";

import { games, generateRoomCode } from "./Global";
import config from "../config.json";
import movement from "./MovementSocket";
import { Room } from "./Game/Room";
import { Player } from "./Game/Player";
import { JoinRoomRequest, JoinRoomRequestZod } from "./Models";
import { z } from "zod";

const app: ExpressInterface = Express();
const server: Server = createServer(app);
const io: SocketIOServer = new SocketIOServer(server, {
	cors: {
		origin: "http://localhost:5173",
		methods: ["GET", "POST"],
		credentials: true,
	},
});

movement.register(io);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_PATH = path.join(__dirname, "..", "public");
const SHARED_PATH = path.join(PUBLIC_PATH, "..", "..", "shared");

app.use(Express.json());
app.use("/", Express.static(PUBLIC_PATH));
app.use("/shared", Express.static(SHARED_PATH));

//TODO Request validation

app.post("/createRoom", (req: Request, res: Response) => {
	const roomID = generateRoomCode();
	const userUUID = uuid();

	games.set(roomID, new Room(roomID));

	res.status(200).json({
		roomID: roomID,
		userUUID: userUUID,
	});
});

app.get("/joinRoom/:id", (req: Request, res: Response) => {
	const id = req.params["id"];

	try {
		z.string().length(6).parse(id);
	} catch (e) {
		res.sendStatus(400);
		return;
	}

	const userUUID = uuid();

	res.status(200).json({
		roomID: id,
		userUUID: userUUID,
	});
});

app.get("/game/:id", (req: Request, res: Response) => {
	res.status(200).sendFile(path.join(__dirname, "../public/game.html"));
});

server.listen(config.PORT, () => {
	console.log(`App running on http://localhost:${config.PORT}`);
});
