//@ts-nocheck

document.getElementById("create").addEventListener("click", async () => {
	const nick = document.getElementById("createNick").value;
	sessionStorage.setItem("userNick", nick);

	let response = await (
		await fetch("/api/createRoom", {
			method: "post",
			headers: {
				"Content-Type": "application/json",
			},
		})
	).json();

	sessionStorage.setItem("userUUID", response["userUUID"]);

	window.location.href = "/api/game/" + response["roomID"];
});

document.getElementById("join").addEventListener("click", async () => {
	const nick = document.getElementById("nick").value;
	sessionStorage.setItem("userNick", nick);

	const roomID = document.getElementById("roomID").value;

	let response = await (
		await fetch(`/api/joinRoom/${roomID}`, {
			method: "get",
		})
	).json();

	sessionStorage.setItem("userUUID", response["userUUID"]);

	window.location.href = "/api/game/" + response["roomID"];
});
