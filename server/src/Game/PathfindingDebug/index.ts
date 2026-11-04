import { LOG } from "../../Logger";
import { SocketData } from "../../Models";
import { Level } from "../Level";
import { Grid } from "../Pathfinding";
import { Server, createServer, get } from "http";
import { DefaultEventsMap, Namespace, Server as SocketIOServer } from "socket.io";
import Express from "express";
import { Express as ExpressInterface, Request, Response } from "express";
import CONFIG from "../../../config.json";
import path from "path";
import { fileURLToPath } from "url";
import { register } from "./socket";
import { Vector2 } from "@shared/commonModels";

interface GridData {
	grid: Grid;
	level: Level;
}

interface GridInterface {
	width: number;
	height: number;
	nodes: NodeInterface[][];
	paths: Vector2[][];
}

interface NodeInterface {
	x: number;
	y: number;
	g: number;
	h: number;
	type: "Player" | "Wall" | "Entity" | "Angel" | "Air"; // Only for drawing
	isInPath: boolean;
	isWall: boolean; // Inversed 'isPassable'
}

export class DebugServer {
	public static id: number = 0;

	private grids: Map<string, GridData> = new Map();
	private app: ExpressInterface;
	private server: Server;
	private io: SocketIOServer;
	private endpoint: Namespace;

	private __filename = fileURLToPath(import.meta.url);
	private __dirname = path.dirname(this.__filename);

	private PUBLIC_PATH = path.join(this.__dirname, "public");
	private INDEX_PATH = path.join(this.__dirname, "index.html");
	private GAME_SCREEN_PATH = path.join(this.__dirname, "game.html");

	public registerGrid(roomID: string, grid: Grid, level: Level) {
		this.grids.set(roomID, { grid, level });

		LOG.debug(`${roomID} registered its pathfinder (${level.getID()}).`);
	}

	public unregisterGrid(roomID: string) {
		this.grids.delete(roomID);

		LOG.debug(`${roomID} unregistered its pathfinder.`);
	}

	public notifyChange(roomID: string) {
		this.endpoint.to(roomID).emit("changed", this.parseData(roomID));
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

		this.endpoint = register(this.io);

		this.app.use(Express.json());
		this.app.use("/public", Express.static(this.PUBLIC_PATH));
		this.setupRoutes();

		this.server.listen(CONFIG.PATHFINDING_DEBUG_SERVER_PORT, () => {
			LOG.debug(
				`Pathfinding debug utility [${DebugServer.id}] running on http://localhost:${CONFIG.PATHFINDING_DEBUG_SERVER_PORT}`,
			);
		});
	}

	private parseData(id: string) {
		const grid = this.grids.get(id)!.grid;

		const response: GridInterface = {
			width: grid.width,
			height: grid.height,
			nodes: [] as NodeInterface[][],
			paths: [] as Vector2[][],
		};

		for (let y = 0; y < grid.grid.length; y++) {
			response.nodes.push([]);
			for (let x = 0; x < grid.grid[0].length; x++) {
				const node = grid.grid[y][x];
				const nodeInt: NodeInterface = {
					x: node.x,
					y: node.y,
					g: node.g,
					h: node.h,
					type: node.type,
					isInPath: node.isInPath,
					isWall: node.isWall,
				};

				const array = response.nodes[y] as NodeInterface[];
				array.push(nodeInt);
			}
		}

		grid.paths.forEach((path) => {
			const nodes: Vector2[] = [];

			path.forEach((n) => {
				nodes.push({ x: n.x, y: n.y });
			});

			response.paths.push(nodes);
		});

		return response;
	}

	private setupRoutes() {
		this.app.get("/", (req, res) => this.home(req, res));
		this.app.get("/games", (req, res) => this.games(req, res));
		this.app.get("/:id", (req, res) => this.gameScreen(req, res));
		this.app.get("/game/:id", (req, res) => this.game(req, res));
	}

	private games(req: Request, res: Response) {
		const response: Record<string, any> = {};

		this.grids.forEach((v, k) => {
			response[k] = {
				levelID: v.level.getID(),
				players: v.level.room.players.size,
			};
		});

		res.status(200).json(response);
	}

	//? /:id
	private game(req: Request, res: Response) {
		const { id } = req.params as { id: string };

		res.status(200).send(this.parseData(id));
	}

	private gameScreen(req: Request, res: Response) {
		res.status(200).sendFile(this.GAME_SCREEN_PATH);
	}

	//? /
	private home(req: Request, res: Response) {
		res.status(200).sendFile(this.INDEX_PATH);
	}
}

export const PathfindingDebug = (() => {
	if (CONFIG.PATHFINDING_DEBUG_SERVER) return new DebugServer();
	else return undefined;
})();
