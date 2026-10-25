export interface LevelData {
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
	fieldInstances: LevelFieldInstance[];
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
	fieldInstances?: unknown[];
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
	fieldInstances: EntityFieldInstance[];
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

//=========================
//  LEVEL CUSTOM FIELDS
//=========================

export type LevelCustomField = "LevelGroup" | "IndexInGroup";

export interface LevelCustomFieldsData {
	groupName: string;
	groupIndex: number;
}
export interface LevelFieldInstance {
	__identifier: LevelCustomField;
	__type: string;
	__value: any;
	__tile: null;
	defUid: number;
	realEditorValues: unknown[];
}

//=========================
//  ENTITY CUSTOM FIELDS
//=========================

// export type EntityCustomField = "ActivationGroup" | "ActivationCount";

export type Direction = "Right" | "Left" | "Up" | "Down";
export const DirectionOppositeMap: Record<Direction, Direction> = {
	Right: "Left",
	Left: "Right",
	Up: "Down",
	Down: "Up",
} as const;

export interface EntityCustomFieldsData {
	ActivationGroup: CustomField<string>;
	ActivationCount: CustomField<number>;
	StaysOn: CustomField<boolean>;
	OnlyKillThePlayer: CustomField<boolean>;
	Direction: CustomField<Direction>;
	Speed: CustomField<number>;
	Distance: CustomField<number>;
	Cooldown: CustomField<number>;
	Mass: CustomField<number>;
}

export type EntityCustomFieldTypeMap = {
	ActivationGroup: string;
	ActivationCount: number;
	StaysOn: boolean;
	OnlyKillThePlayer: boolean;
	Direction: number;
	Speed: number;
	Distance: number;
	Cooldown: number;
	Mass: number;
};

export type EntityCustomField = keyof EntityCustomFieldsData;

export interface CustomField<T> {
	value: T | undefined;
	doesExist: boolean | undefined;
}

export const DummyEntityCustomFields: EntityCustomFieldsData = {
	ActivationGroup: {
		doesExist: false,
		value: undefined,
	},
	ActivationCount: {
		doesExist: false,
		value: undefined,
	},
	StaysOn: {
		doesExist: false,
		value: undefined,
	},
	OnlyKillThePlayer: {
		doesExist: false,
		value: undefined,
	},
	Direction: {
		doesExist: false,
		value: undefined,
	},
	Speed: {
		doesExist: false,
		value: undefined,
	},
	Distance: {
		doesExist: false,
		value: undefined,
	},
	Cooldown: {
		doesExist: false,
		value: undefined,
	},
	Mass: {
		doesExist: false,
		value: undefined,
	},
} as const;

export interface EntityFieldInstance {
	__identifier: string;
	__type: string;
	__value: any;
	__tile: null;
	defUid: number;
	realEditorValues: unknown[];
}

//=========================
//         OTHER
//=========================

export type LayerType = "Entities" | "Tiles" | "IntGrid" | "AutoLayer";

export type EntityType =
	| "Player"
	| "MapCollider"
	| "JohnEntity"
	| "Button"
	| "Key"
	| "Door"
	| "ButtonDoor"
	| "Pushable"
	| "Spike"
	| "PlayerSpawner"
	| "MovingPlatform"
	| "Laser";
