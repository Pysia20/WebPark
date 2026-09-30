export interface MapData {
	__header__: Header;
	identifier: string;
	iid: string;
	uid: number;
	worldX: number;
	worldY: number;
	worldDepth: number;
	pxWid: number;
	pxHei: number;
	__bgColor: string;
	bgColor: null;
	useAutoIdentifier: boolean;
	bgRelPath: null;
	bgPos: null;
	bgPivotX: number;
	bgPivotY: number;
	__smartColor: string;
	__bgPos: null;
	externalRelPath: null;
	fieldInstances: unknown[];
	layerInstances: LayerInstance[];
	__neighbours: unknown[];
}

export interface Header {
	fileType: string;
	app: string;
	doc: string;
	schema: string;
	appAuthor: string;
	appVersion: string;
	url: string;
}

export interface LayerInstance {
	__identifier: string;
	__type: LayerType;
	__cWid: number;
	__cHei: number;
	__gridSize: number;
	__opacity: number;
	__pxTotalOffsetX: number;
	__pxTotalOffsetY: number;
	__tilesetDefUid: number | null;
	__tilesetRelPath: null;
	iid: string;
	levelId: number;
	layerDefUid: number;
	pxOffsetX: number;
	pxOffsetY: number;
	visible: boolean;
	optionalRules: unknown[];
	intGridCsv: number[];
	autoLayerTiles: GridTile[];
	seed: number;
	overrideTilesetUid: null;
	gridTiles: GridTile[];
	entityInstances: EntityInstance[];
}

export interface EntityInstance {
	__identifier: string;
	__grid: number[];
	__pivot: number[];
	__tags: unknown[];
	__tile: null;
	__smartColor: string;
	iid: string;
	width: number;
	height: number;
	defUid: number;
	px: number[];
	fieldInstances: unknown[];
	__worldX: number;
	__worldY: number;
}

export interface GridTile {
	px: number[];
	src: number[];
	f: number;
	t: number;
	d: number[];
	a: number;
}

export class MapCollider {
	private _forceInstance!: void;
	public x: number = -1;
	public y: number = -1;
	public width: number = -1;
	public height: number = -1;

	constructor(x: number, y: number, width: number, height: number) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
}

export type LayerType = "Entities" | "Tiles" | "IntGrid" | "AutoLayer";

export type EntityType = "JohnEntity" | "Button" | "Key" | "Door";
