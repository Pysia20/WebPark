/** @type {import("socket.io-client").Socket} */
const socket = io("/debug", {
	path: "/socket",
});

const roomID = window.location.href.split("/")[window.location.href.split("/").length - 1]; // Beatifull line

document.title = "RoomID: " + roomID;

async function GetData() {
	const data = await (await fetch(`/game/${roomID}`)).json();
	console.log(data);
}

GetData();
