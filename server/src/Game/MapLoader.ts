import fs from "fs";
import path from "path";
import { Map } from "./Map";
import { MapData } from "../../../shared/commonMapModels";

class MapLoader {
	private loadedMaps: Map[] = [];
	private foundMaps: string[] = []; // Ids of maps in maps directory

	public readonly MAP_DIRECTORY: string = path.join(import.meta.dirname, "../../../shared/maps/");

	constructor() {
		const result = fs.readdirSync(this.MAP_DIRECTORY, {
			encoding: "utf8",
			withFileTypes: true,
		});

		result.forEach((e) => {
			if (e.isDirectory()) this.foundMaps.push(e.name);
		});
	}

	public LoadMap(id: string) {
		if (!this.foundMaps.includes(id)) throw Error("Map with this ID (name) doesn't exist.");
		const mapData = JSON.parse(
			fs.readFileSync(path.join(this.MAP_DIRECTORY, id), {
				encoding: "utf8",
			}),
		) as MapData;

		// const map = new Map(mapData);
	}
}

export const MAP_LOADER: MapLoader = new MapLoader();
