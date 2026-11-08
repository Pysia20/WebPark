import mysql, { PoolOptions } from "mysql2/promise";
import CONFIG from "../config.json";

import * as dotenv from "dotenv";
dotenv.config({ quiet: true });

const access: PoolOptions = {
	host: process.env["DB_HOST"],
	user: process.env["DB_USER"],
	password: process.env["DB_PASSWORD"],
	database: "WebPark",
};

export const conn: mysql.Pool | undefined = CONFIG.ENABLE_LEADERBOARD
	? mysql.createPool(access)
	: undefined;
