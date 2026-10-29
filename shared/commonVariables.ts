/*
==========================================
NERD		NERD		NERD		NERD
==========================================
 */

export const GROUND_DETECTON_OFFSET = 1;
export const COLLISION_MARGIN_Y = 2;
export const COLLISION_MARGIN_X = COLLISION_MARGIN_Y;
export const HORIZONTAL_BIAS = 1.5;
export const DESPAWN_BUFFER = 300;

export const WORLD_CONFIG = {
	CELL_SIZE: 64,
};

export const ROOM_CONFIG = {
	MAX_PLAYERS: 8,
};

export const CLIENT_CONFIG = {
	UPDATE_RATE: 30, // How often client sends inputs data to server, (20)=20 times a second, (30)=30 times a second etc
	MOUSE_MARGIN: 5 // How many pixels the mouse has to move from the previous pos for it to be broadcasted
}

export const PLAYER_CONFIG = {
	ACCELERATION: 40,
	MAX_HORIZONTAL_SPEED: 150,
	MAX_VERTICAL_SPEED: 500,
	DRAG: 25,
	GRAVITY: 28,
	JUMP_FORCE: 40000000000000000000000000000000000, // <=== this doesn't do anything bruh
	HEIGHT: 74,
	WIDTH: 64,
	JUMP_BUFFER_TIME: 0.1, // 100ms = 0.1s
	JUMP_FRAMES_MAX: 10, // 1/3 of a second
	COYOTE_TIME: 120, //ms
	// GROUND_DETECTON_OFFSET: 1,
} as const;

export const CANNON_CONFIG = {
	PROEJCTILE_WIDTH: 48,
	PROJECTILE_HEIGHT: 32,
};

export const PUSHABLE_CONFIG = {
	DRAG: 45, // Player drag * 3 (I have no idea why but it works)
	GRAVITY: 15,
	MAX_HORIZONTAL_SPEED: 150,
	MAX_VERTICAL_SPEED: 500,
};

/*
==========================================
VISUAL		VISUAL		VISUAL		VISUAL
==========================================
 */

export const PLAYER_VISUAL_CONFIG = {
	LERP: 0.3,

	TORSO: {
		HEIGHT_RATIO: 0.9,
		LEAN: 3,
		PUSH_LEAN_RATIO: 0.2,

		LERP: 0.3
	},

	LEG: {
		STROKE_WIDTH: 3,
		LENGTH_RATIO: 0.125,
		MAX_STRETCH: 24,
		LIFT_RATIO: 0.095,
		DRAG: 0.01,

		STEP: 16,
		STEP_SPEED: 0.15,
		STEP_MIN_OFFSET_RATIO: 0.08,
		STEP_NUDGE_RATIO: 0.09,

		HIP_Y_OFFSET_RATIO: 0.9,
		HIP_X_OFFSET_RATIO: 0.25,
		HIP_TUCK: 2,

		LERP: 0.3
	},

	EYE: {
		MAX_LENGTH: 16,
		STROKE_WIDTH: 5,
		Y_OFFSET_RATIO: 0.2,
		X_OFFSET_RATIO: 0.25,
		SNAP_THRESHOLD: 3,
		SQUINT: 40,
		LOOK_OFFSET_RATIO: 0.1,
		X_LOOK: 1.8,
		Y_LOOK: 1.6,

		PUSH_SQUINT_LERP_MAX: 0.35,
		PUSH_SQUINT_LERP_MIN: 0.025,
		PUSH_SQUINT: 0.4,
		PUSH_OFFSET_X: 0.1,
		PUSH_OFFSET_Y: 0.05,

		BLINK_INTERVAL_BASE: 300,
		BLINK_INTERVAL_RANDOM: 350,
		BLINK_SPEED: 2.5,
		BLINK_WIDTH_SPEED: 0.5,

		LERP: 0.25
	},

	ARM: {
		WIDTH: 4,
		LENGTH: 20,
		OFFSET: 0.9,
		Y_OFFSET: 4,
		TOUCH_SPEED: 0.1
	},

	NICK: {
		COLOR: "#ffffff",
		ME_COLOR: "#FFD700",
		FONT_SIZE: 12,
		OFFSET: 0.5
	}
} as const;

export const ENTITY_VISUAL_CONFIG = {
	JOHN: {
		LERP: 0.3,
	},

	LASER: {
		AMPLITUDE: 25, //~30 == one block (64px)
		FREQUENCY: 0.25,
		OFFSET: 0.5,
		STEP: 28, //kind of like quality? length / STEP
		JITTER: 30,
		WIDTH: 4,
		COLOR: "#ff0000",
		OPACITY: 0.8,

		BASE_COLOR: "#d90000",
		BASE_START_OFFSET: 1, //X
		BASE_WALL_OFFSET: 5, //Y
		BASE_SPIKE_OFFSET: 10, //Y

		GLOW_COLOR: "#ff0000",
		GLOW_OPACITY: 0.4,
		GLOW_WIDTH: 12,

		AMPLITUDE_DAMP_SPEED: 0.08,
		OPACITY_DAMP_SPEED: 0.04,
		JITTER_DAMP_SPEED: 24,
		AMPLITUDE_UNDAMP_SPEED: 0.08,
		OPACITY_UNDAMP_SPEED: 0.08,
		JITTER_UNDAMP_SPEED: 0.32,
	},

	BOOR: {
		CLOSE_RATIO: 0.15,
		MIN_OPACITY: 0.05,
		LARP: 0.3,
	},
} as const;
