import z from "zod";

export type Vector2 = { x: number; y: number };

export interface PlayerInputs {
	left: boolean;
	right: boolean;
	jump: boolean;
}

// What the backend sends to the client
export interface ServerData {
	playerData: Record<number, ServerPlayerData>;
}

export interface ServerPlayerData {
	nick: string;
	pos: Vector2;
	velocity: Vector2;
}

// What the client sends to the backend
export interface ClientData {
	inputs: PlayerInputs;
}

// Server -> Client when player joins a room (Server sends an array of that)
export interface PlayerJoinedData {
	playerID: number;
	nick: string;
	color: string;
}

//###############################################################
// DEJMI TEGO NIE MUSISZ IMPORTOWAC NIGDZIE IMPORTUJ TO NIZEJ
//###############################################################
export const RegisterUserDataZod = z
	.object({
		roomID: z.string().length(6),
		userID: z.number(),
		userNick: z.string(),
		color: z.string().length(7),
	})
	.strict();

export type RegisterUserData = z.infer<typeof RegisterUserDataZod>;

export type SomethingBrokeData = {
	name: string; // Name of the error (usually just default Error)
	message: string; // Description of the error
	eventName: string; // In which socket event the error occured
};


//LDTK STUFF (generated with quciktype.io)

export interface LevelData {
	__header__:        Header;
	identifier:        string;
	iid:               string;
	uid:               number;
	worldX:            number;
	worldY:            number;
	worldDepth:        number;
	pxWid:             number;
	pxHei:             number;
	__bgColor:         string;
	bgColor:           null;
	useAutoIdentifier: boolean;
	bgRelPath:         null;
	bgPos:             null;
	bgPivotX:          number;
	bgPivotY:          number;
	__smartColor:      string;
	__bgPos:           null;
	externalRelPath:   null;
	fieldInstances:    unknown[];
	layerInstances:    LayerInstance[];
	__neighbours:      unknown[];
}

export interface Header {
	fileType:   string;
	app:        string;
	doc:        string;
	schema:     string;
	appAuthor:  string;
	appVersion: string;
	url:        string;
}

export interface LayerInstance {
	__identifier:       string;
	__type:             string;
	__cWid:             number;
	__cHei:             number;
	__gridSize:         number;
	__opacity:          number;
	__pxTotalOffsetX:   number;
	__pxTotalOffsetY:   number;
	__tilesetDefUid:    number | null;
	__tilesetRelPath:   null;
	iid:                string;
	levelId:            number;
	layerDefUid:        number;
	pxOffsetX:          number;
	pxOffsetY:          number;
	visible:            boolean;
	optionalRules:      unknown[];
	intGridCsv:         number[];
	autoLayerTiles:     GridTile[];
	seed:               number;
	overrideTilesetUid: null;
	gridTiles:          GridTile[];
	entityInstances:    EntityInstance[];
}

export interface EntityInstance {
	__identifier:   string;
	__grid:         number[];
	__pivot:        number[];
	__tags:         unknown[];
	__tile:         null;
	__smartColor:   string;
	iid:            string;
	width:          number;
	height:         number;
	defUid:         number;
	px:             number[];
	fieldInstances: unknown[];
	__worldX:       number;
	__worldY:       number;
}

export interface GridTile {
	px:  number[];
	src: number[];
	f:   number;
	t:   number;
	d:   number[];
	a:   number;
}
