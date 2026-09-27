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
			if (e.isFile() && e.name.split(".").at(-1)?.toLowerCase() == "ldtkl")
				this.foundMaps.push(e.name.split(".")[0]);
		});

		console.log(this.foundMaps);
	}

	public LoadMap(id: string) {
		let mapIndex = -1; // -1 means that the map isn't loaded
		for (let i = 0; i < this.loadedMaps.length; i++) {
			if (this.loadedMaps[i].id == id) {
				mapIndex = i;
				break;
			}
		}

		if (mapIndex != -1) {
			return this.loadedMaps[mapIndex];
		}

		if (!this.foundMaps.includes(id)) throw Error("Map with this ID (name) doesn't exist.");

		const mapData = JSON.parse(
			fs.readFileSync(path.join(this.MAP_DIRECTORY, `${id}.ldtkl`), {
				encoding: "utf8",
			}),
		) as MapData;

		const map = new Map(mapData);
		this.loadedMaps.push(map);

		return map;
	}
}

export const MAP_LOADER: MapLoader = new MapLoader();
