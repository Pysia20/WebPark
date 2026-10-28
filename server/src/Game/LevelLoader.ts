import fs from "fs";
import path from "path";
import { LevelTemplate } from "./LevelTemplate";
import { LevelData } from "@shared/commonLevelModels";
import { LOG } from "../Logger";
import { Level } from "./Level";
import { Room } from "./Room";

class LevelLoader {
	private loadedLevels: Map<string, LevelTemplate[]> = new Map();

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

				const level = new LevelTemplate(levelData);
				let group: LevelTemplate[] | undefined = this.loadedLevels.get(level.group);

				if (group == undefined) {
					group = [level];
				} else {
					group.splice(level.groupIndex, 0, level);
				}

				this.loadedLevels.set(level.group, group);

				LOG.info(`Level ${id} found and loaded.`);
			}
		});
	}

	public GetLevel(id: string, room: Room): Level {
		LOG.info(`Creating level ${id}`);

		for (const [group, levels] of this.loadedLevels) {
			for (const level of levels) {
				if (level.id == id) return new Level(level, room);
			}
		}

		throw Error("This level doesn't exits.");
	}

	public GetNextLevel(room: Room): Level | undefined {
		const groupLevels = this.loadedLevels.get(room.level.group);

		if (groupLevels === undefined) {
			LOG.error(`Group doesn't exist or didn't load (${room.level.group})`);
			throw Error(`Group doesn't exist or didn't load (${room.level.group})`);
		}

		const nextLevel = groupLevels.at(room.level.groupIndex + 1);

		if (nextLevel === undefined) {
			return undefined;
		}

		LOG.info(`Creating level ${nextLevel.id}`);
		return new Level(nextLevel, room);
	}
}

export const MAP_LOADER: LevelLoader = new LevelLoader();
