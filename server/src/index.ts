import Express from "express";
import { Express as ExpressInterface, Request, Response } from "express";
import { Server, createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

import config from "../config.json";
import movement from "./MovementSocket";

const app: ExpressInterface = Express();
const server: Server = createServer(app);
const io: SocketIOServer = new SocketIOServer(server);

movement.register(io);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicPath = path.join(__dirname, "..", "public");

app.use(Express.json());
app.use("/static", Express.static(publicPath));

// app.get("/", (req: Request, res: Response) => {
// 	res.sendStatus(200);
// });

server.listen(config.PORT, () => {
	console.log(`App running on http://localhost:${config.PORT}`);
});
