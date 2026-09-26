export interface MapData {
	identifier: string;
	uniqueIdentifer: string;
	x: number;
	y: number;
	width: number;
	height: number;
	bgColor: string;
	neighbourLevels: unknown[];
	layers: string[];
	entities: Record<string, MapEntity[]>;
}

export interface MapEntity {
	id: string;
	iid: string;
	layer: string;
	x: number;
	y: number;
	width: number;
	height: number;
	color: number;
}

export class Map {
	public readonly id: string; // its name
	public readonly width: number;
	public readonly height: number;

	constructor(data: MapData) {
		this.id = data.identifier;
		this.width = data.width;
		this.height = data.height;
	}

	public generateColliders() {}
}
