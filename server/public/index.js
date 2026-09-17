//@ts-nocheck

// /** @type {import("socket.io-client").Socket} */
// const socket = io("http://localhost:3000/player");

// socket.on("connect", () => {
// 	console.log("Web socket created");

// 	const uuid = sessionStorage.getItem("userUUID");
// 	socket.emit("registerUser", {
// 		uuid: uuid,
// 	});
// });

document.getElementById("create").addEventListener("click", async () => {
	const nick = document.getElementById("createNick").value;

	sessionStorage.setItem("userNick", nick);

	let response = await (
		await fetch("/createRoom", {
			method: "post",
		})
	).json();

	window.location.replace("/game/" + response["roomID"]);
});
