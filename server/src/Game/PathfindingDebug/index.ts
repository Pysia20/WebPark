import { LOG } from "../../Logger";
import { SocketData } from "../../Models";
import { Level } from "../Level";
import { Grid } from "../Pathfinding";
import { Server, createServer, get } from "http";
import { DefaultEventsMap, Server as SocketIOServer } from "socket.io";
import Express from "express";
import { Express as ExpressInterface, Request, Response } from "express";
import CONFIG from "../../../config.json";
import path from "path";
import { fileURLToPath } from "url";
import { register } from "./socket";

export class DebugServer {
	public static id: number = 0;

	private grids: Record<string, Grid> = {};
	private app: ExpressInterface;
	private server: Server;
	private io: SocketIOServer;

	private __filename = fileURLToPath(import.meta.url);
	private __dirname = path.dirname(this.__filename);

	private PUBLIC_PATH = path.join(this.__dirname, "public");
	private INDEX_PATH = path.join(this.__dirname, "index.html");

	public registerGrid(roomID: string, grid: Grid, level: Level) {
		this.grids[roomID] = grid;

		LOG.debug(`${roomID} registered its pathfinder (${level.getID()}).`);
	}

	public unregisterGrid(roomID: string) {
		delete this.grids[roomID];

		LOG.debug(`${roomID} unregistered its pathfinder.`);
	}

	constructor() {
		DebugServer.id++;

		this.app = Express();
		this.server = createServer(this.app);
		this.io = new SocketIOServer<
			DefaultEventsMap,
			DefaultEventsMap,
			DefaultEventsMap,
			SocketData
		>(this.server, {
			path: "/socket",
			cors: {
				origin: ["http://localhost:5173", "https://webpark.mywire.org", "webpark.dino.icu"],
				methods: ["GET", "POST"],
				credentials: true,
			},
			connectionStateRecovery: {
				maxDisconnectionDuration: 2 * 60 * 1000,
				skipMiddlewares: false,
			},
		});

		register(this.io);

		this.app.use(Express.json());
		this.app.use("/public", Express.static(this.PUBLIC_PATH));
		this.setupRoutes();

		this.server.listen(CONFIG.PATHFINDING_DEBUG_SERVER_PORT, () => {
			LOG.debug(
				`Pathfinding debug utility [${DebugServer.id}] running on http://localhost:${CONFIG.PATHFINDING_DEBUG_SERVER_PORT}`,
			);
		});
	}

	private setupRoutes() {
		this.app.get("/", (req, res) => this.home(req, res));
	}

	private home(req: Request, res: Response) {
		res.status(200).sendFile(this.INDEX_PATH);
	}
}

export const PathfindingDebug = (() => {
	if (CONFIG.PATHFINDING_DEBUG_SERVER) return new DebugServer();
	else return undefined;
})();
