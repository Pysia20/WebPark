// @ts-nocheck

/** @type {import('socket.io-client').Socket} */
const socket = io("http://localhost:3000/player");

socket.on("connect", () => {
	console.log("sent");
});

const canvas = document.getElementById("canvas");
const ctx = (() => {
	if (canvas instanceof HTMLCanvasElement) {
		return canvas.getContext("2d");
	} else {
		throw new Error("HTML Element of id 'canvas' is not a HTMLCanvasElement.");
	}
})();

const PLAYER_SPEED = 100;
const GRAVITY = 20;
const JUMP_FORCE = 1000;

let toStop = false;
let IS_GROUNDED = false;
let CANCEL_GRAVITY_FRAME = true;

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

const playerTemplate = {
	pos: {
		x: 0,
		y: 0,
	},
	size: 10,
	velocity: {
		x: 0,
		y: 0,
	},
};

const players = [];

let currentPlayer = { ...playerTemplate };

let lastTime = performance.now();

addEventListener("keydown", (e) => {
	if (event.repeat) return;
	if (e.key === "d") {
		currentPlayer.velocity.x += PLAYER_SPEED;
	}
	if (e.key === "a") {
		currentPlayer.velocity.x += -PLAYER_SPEED;
	}
	if (e.key === " " && IS_GROUNDED) {
		currentPlayer.velocity.y -= JUMP_FORCE;
		IS_GROUNDED = false;
	}
});

addEventListener("keyup", (e) => {
	if (e.key === "d") {
		currentPlayer.velocity.x -= PLAYER_SPEED;
	}
	if (e.key === "a") {
		currentPlayer.velocity.x -= -PLAYER_SPEED;
	}
});

function clampPosition() {
	if (currentPlayer.pos.y >= 300 - playerTemplate.size) {
		currentPlayer.pos.y = 300 - playerTemplate.size;
		currentPlayer.velocity.y = 0;
		IS_GROUNDED = true;
	}
}

function update(currentTime) {
	const deltaTime = (currentTime - lastTime) / 1000;
	lastTime = currentTime;

	if (!CANCEL_GRAVITY_FRAME) {
		currentPlayer.velocity.y += GRAVITY;
	}
	CANCEL_GRAVITY_FRAME = false;

	currentPlayer.pos.x += currentPlayer.velocity.x * deltaTime;
	currentPlayer.pos.y += currentPlayer.velocity.y * deltaTime;
	clampPosition();

	drawCanvas();

	if (!toStop) {
		requestAnimationFrame(update);
	}
}

function drawCanvas() {
	ctx.clearRect(0, 0, 300, 300);
	ctx.fillStyle = "blue";
	ctx.strokeStyle = "blue";

	ctx.fillRect(currentPlayer.pos.x, currentPlayer.pos.y, currentPlayer.size, currentPlayer.size);
}

requestAnimationFrame(update);
