//@ts-nocheck

/** @type {import("socket.io-client").Socket} */
const socket = io("http://localhost:3000/player");

socket.on("connect", () => {});

socket.on("roomInfo", (e) => {
	console.log(e);
});

document.getElementById("join").addEventListener("click", () => {
	const nick = document.getElementById("nick").value;
	const roomID = document.getElementById("roomID").vale;
});
