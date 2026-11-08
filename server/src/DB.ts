import mysql, { PoolOptions } from "mysql2/promise";
import * as dotenv from "dotenv";
dotenv.config({ quiet: true });

const access: PoolOptions = {
	user: process.env["DB_USER"],
	password: process.env["DB_PASSWORD"],
	database: "WebPark",
};

export const conn: mysql.Pool = mysql.createPool(access);
