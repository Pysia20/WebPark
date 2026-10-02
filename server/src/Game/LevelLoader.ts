import fs from "fs";
import path from "path";
import { Level } from "./Level";
import { LevelData } from "@shared/commonLevelModels";
import { LOG } from "../Logger";

class LevelLoader {
	private loadedLevels: Level[] = [];
	private foundLevels: string[] = []; // Ids of maps in maps directory

	public readonly LEVEL_DIRECTORY: string = path.join(
		import.meta.dirname,
		"../../../shared/maps/",
	);

	constructor() {
		const result = fs.readdirSync(this.LEVEL_DIRECTORY, {
			encoding: "utf8",
			withFileTypes: true,
		});

		result.forEach((e) => {
			if (e.isFile() && e.name.split(".").at(-1)?.toLowerCase() == "json")
				this.foundLevels.push(e.name.split(".")[0]);
		});

		LOG.info(this.foundLevels);
	}

	public LoadLevel(id: string) {
		let levelIndex = -1; // -1 means that the map isn't loaded
		for (let i = 0; i < this.loadedLevels.length; i++) {
			if (this.loadedLevels[i].id == id) {
				levelIndex = i;
				break;
			}
		}

		if (levelIndex != -1) {
			return this.loadedLevels[levelIndex];
		}

		if (!this.foundLevels.includes(id)) throw Error("Level with this ID (name) doesn't exist.");

		const levelData = JSON.parse(
			fs.readFileSync(path.join(this.LEVEL_DIRECTORY, `${id}.json`), {
				encoding: "utf8",
			}),
		) as LevelData;

		const map = new Level(levelData);
		this.loadedLevels.push(map);

		return map;
	}
}

export const MAP_LOADER: LevelLoader = new LevelLoader();
