import fs from "fs";
import path from "path";
import { Level } from "./Level";
import { LevelData } from "@shared/commonLevelModels";
import { LOG } from "../Logger";

class LevelLoader {
	private loadedLevels: Map<string, Level[]> = new Map();

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
			if (e.isFile() && e.name.split(".").at(-1)?.toLowerCase() == "json") {
				const id: string = e.name.split(".")[0];

				const levelData = JSON.parse(
					fs.readFileSync(path.join(this.LEVEL_DIRECTORY, `${id}.json`), {
						encoding: "utf8",
					}),
				) as LevelData;

				const level = new Level(levelData);
				let group: Level[] | undefined = this.loadedLevels.get(level.group);

				if (group == undefined) {
					group = [level];
				} else {
					group.splice(level.groupIndex, 0, level);
				}

				this.loadedLevels.set(level.group, group);
			}
		});
	}

	public GetLevel(id: string): Level {
		for (const [group, levels] of this.loadedLevels) {
			for (const level of levels) {
				if (level.id == id) return level;
			}
		}

		throw Error("This level doesn't exits.");
	}

	public GetNextLevel(group: string, currentIndex: number): Level | undefined {
		const groupLevels = this.loadedLevels.get(group);

		if (groupLevels === undefined) {
			LOG.error(`Group doesn't exist or didn't load (${group})`);
			throw Error(`Group doesn't exist or didn't load (${group})`);
		}

		const nextLevel = groupLevels.at(currentIndex + 1);

		return nextLevel;
	}
}

export const MAP_LOADER: LevelLoader = new LevelLoader();
