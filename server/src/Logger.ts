import pino from "pino";
import config from "../config.json";

const date = new Date(Date.now()).toISOString().replace(/[:.]/g, "-");
const filename = `./logs/${date}.jsonl`;

const transport = (() => {
	if (config.SAVE_LOG) {
		return pino.transport({
			targets: [
				{
					target: "pino/file", // Target 1: The file
					options: { destination: filename, mkdir: true },
				},
				{
					target: "pino-pretty", // Target 2: The console (formatted/pretty)
					options: { destination: 1, translateTime: "SYS:dd-mm-yyyy | HH:MM:ss" }, // 1 represents stdout (the terminal)
				},
			],
		});
	}

	return pino.transport({
		targets: [
			{
				target: "pino-pretty", // Target 2: The console (formatted/pretty)
				options: { destination: 1, translateTime: "SYS:dd-mm-yyyy | HH:MM:ss" }, // 1 represents stdout (the terminal)
			},
		],
	});
})();

export const LOG = pino(transport);
