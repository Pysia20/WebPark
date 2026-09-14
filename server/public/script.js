// @ts-check

/** @type {import('socket.io-client').Socket} */
// @ts-ignore
const socket = io("http://localhost:3000/move");

socket.on("connect", () => {
	console.log("sent");
});
