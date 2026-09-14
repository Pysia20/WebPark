import Express from "express";
import { Express as ExpressInterface, Request, Response } from "express";

import config from "../config.json";

const app: ExpressInterface = Express();

app.use(Express.json());

app.listen(config.PORT, () => {
	console.log(`App running on http://localhost:${config.PORT}`);
});
