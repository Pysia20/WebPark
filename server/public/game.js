// @ts-nocheck

const info = document.getElementById("infoList");
const roomID = window.location.pathname.split("/")[2];

document.getElementById("roomIDH1").textContent = roomID;

/** @type {import("socket.io-client").Socket} */
const socket = io("http://localhost:3000/player");

socket.on("connect", () => {
	console.log("Web socket created");

	const uuid = sessionStorage.getItem("userUUID");
	const nick = sessionStorage.getItem("userNick");
	socket.emit(
		"registerUser",
		{
			roomID: roomID,
			userUUID: uuid,
			userNick: nick,
		},
		(e) => {
			console.log(e);
		},
	);
});

socket.on("userJoined", (data) => {
	info.innerHTML += `<li>${data} joined the room.</li>`;
});

// GAME

/*
const canvas = document.getElementById("canvas");
const ctx = (() => {
	if (canvas instanceof HTMLCanvasElement) {
		return canvas.getContext("2d");
	} else {
		throw new Error("HTML Element of id 'canvas' is not a HTMLCanvasElement.");
	}
})();

const INPUTS = {
	A: false,
	D: false,
	SPACE: false,
};

const PLAYER_SPEED = 100;
const GRAVITY = 20;
const JUMP_FORCE = 1000;
const DRAG = 20;

let toStop = false;
let IS_GROUNDED = false;
let CANCEL_GRAVITY_FRAME = true;

let lastTime = performance.now();
let lastPacketSent = lastTime;

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

addEventListener("keydown", (e) => {
	if (event.repeat) return;
	if (e.key === "d") {
		INPUTS.D = true;
	}
	if (e.key === "a") {
		INPUTS.A = true;
	}
	if (e.key === " ") {
		INPUTS.SPACE = true;
	}
});

addEventListener("keyup", (e) => {
	if (e.key === "d") {
		INPUTS.D = false;
	}
	if (e.key === "a") {
		INPUTS.A = false;
	}
	if (e.key === " ") {
		INPUTS.SPACE = false;
	}
});

function clampPosition() {
	if (currentPlayer.pos.y >= 300 - playerTemplate.size) {
		currentPlayer.pos.y = 300 - playerTemplate.size;
		currentPlayer.velocity.y = 0;
		IS_GROUNDED = true;
	}
}

function addVelocities() {
	if (INPUTS.A) {
		currentPlayer.velocity.x = -PLAYER_SPEED;
	}

	if (INPUTS.D) {
		currentPlayer.velocity.x = PLAYER_SPEED;
	}

	if (!INPUTS.A && !INPUTS.D) {
		currentPlayer.velocity.x = 0;
	}

	currentPlayer.velocity.x = clamp(currentPlayer.velocity.x, -PLAYER_SPEED, PLAYER_SPEED);

	if (INPUTS.SPACE && IS_GROUNDED) {
		currentPlayer.velocity.y -= JUMP_FORCE;
		IS_GROUNDED = false;
	}
}

async function update(currentTime) {
	const deltaTime = (currentTime - lastTime) / 1000;

	if (!CANCEL_GRAVITY_FRAME) {
		currentPlayer.velocity.y += GRAVITY;
	}
	CANCEL_GRAVITY_FRAME = false;

	currentPlayer.pos.x += currentPlayer.velocity.x * deltaTime;
	currentPlayer.pos.y += currentPlayer.velocity.y * deltaTime;

	clampPosition();
	addVelocities();

	let packet = {
		inputs: INPUTS,
		pos: currentPlayer.pos,
		velocity: currentPlayer.velocity,
		time: Date.now(),
	};

	// if (currentTime >= lastPacketSent + 500) {
	// 	const response = await socket.emitWithAck("tick", packet);
	// 	console.log(response);
	// 	lastPacketSent = currentTime;
	// }

	drawCanvas();

	lastTime = currentTime;
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
*/
