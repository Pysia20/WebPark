//@ts-nocheck

document.getElementById("create").addEventListener("click", async () => {
	const nick = document.getElementById("createNick").value;
	const color = document.getElementById("color").value;

	sessionStorage.setItem("userNick", nick);
	sessionStorage.setItem("userColor", color);

	let response = await (
		await fetch("/api/createRoom", {
			method: "post",
			headers: {
				"Content-Type": "application/json",
			},
		})
	).json();

	sessionStorage.setItem("userID", response["userID"]);

	window.location.href = "/api/game/" + response["roomID"];
});

document.getElementById("join").addEventListener("click", async () => {
	const nick = document.getElementById("nick").value;
	const color = document.getElementById("color").value;

	sessionStorage.setItem("userNick", nick);
	sessionStorage.setItem("userColor", color);

	const roomID = document.getElementById("roomID").value;

	let response = await (
		await fetch(`/api/joinRoom/${roomID}`, {
			method: "get",
		})
	).json();

	sessionStorage.setItem("userID", response["userID"]);

	window.location.href = "/api/game/" + response["roomID"];
});
