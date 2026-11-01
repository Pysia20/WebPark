/** @type {import("socket.io-client").Socket} */
const socket = io("/debug", {
	path: "/socket",
});

const roomID = window.location.href.split("/")[window.location.href.split("/").length - 1]; // Beatifull line
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

document.title = "RoomID: " + roomID;

let data;

async function getData() {
	data = await (await fetch(`/game/${roomID}`)).json();
}

function prepareCanvas() {}

function draw() {
	data.nodes.foreach((n) => {});
}

getData();
