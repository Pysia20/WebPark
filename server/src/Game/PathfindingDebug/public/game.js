const roomID = window.location.href.split("/")[window.location.href.split("/").length - 1]; // Beatifull line
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

/** @type {import("socket.io-client").Socket} */
const socket = io("/debug", {
	path: "/socket",
	query: { roomID: roomID },
});

const pathColors = [
	"rgb(200, 0, 0, 0.3)",
	"rgb(0, 200, 0, 0.3)",
	"rgb(0, 0, 200, 0.3)",
	"rgb(100, 100, 0, 0.3)",
];

document.title = "RoomID: " + roomID;

let data;
let canvasWidth;
let canvasHeight;

socket.on("changed", (e) => {
	data = e;
	draw();
});

async function getData() {
	data = await (await fetch(`/game/${roomID}`)).json();

	console.log(data);

	prepareCanvas();
	draw();
}

function prepareCanvas() {
	canvasWidth = data.width;
	canvasHeight = data.height;

	canvas.setAttribute("width", canvasWidth);
	canvas.setAttribute("height", canvasHeight);
}

function draw() {
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	data.nodes.forEach((row) => {
		row.forEach((n) => {
			drawNode(n);
		});
	});

	for (let i = 0; i < data.paths.length; i++) {
		drawPath(data.paths[i]);
	}
}

function drawPath(p, i) {
	ctx.globalAlpha = 0.3;
	const index = i % pathColors.length;
	ctx.fillStyle = pathColors[index];

	p.forEach((n) => {
		ctx.fillRect(n.x, n.y, 1, 1);
	});
	ctx.globalAlpha = 1;
}

function drawNode(n) {
	if (n.type == "Wall") drawWall(n);
	if (n.type == "Entity") drawEntity(n);
	if (n.type == "Player") drawPlayer(n);
	if (n.type == "Angel") drawAngel(n);
}

function drawWall(n) {
	ctx.fillStyle = "red";
	ctx.fillRect(n.x, n.y, 1, 1);
}

function drawEntity(n) {
	ctx.fillStyle = "green";
	ctx.fillRect(n.x, n.y, 1, 1);
}

function drawPlayer(n) {
	ctx.fillStyle = "blue";
	ctx.fillRect(n.x, n.y, 1, 1);
}

function drawAngel(n) {
	ctx.fillStyle = "gray";
	ctx.fillRect(n.x, n.y, 1, 1);
}

getData();
