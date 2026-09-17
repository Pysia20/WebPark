//@ts-nocheck

document.getElementById("create").addEventListener("click", async () => {
	const nick = document.getElementById("createNick").value;
	sessionStorage.setItem("userNick", nick);

	let response = await (
		await fetch("/createRoom", {
			method: "post",
			headers: {
				"Content-Type": "application/json",
			},
		})
	).json();

	sessionStorage.setItem("userUUID", response["userUUID"]);

	window.location.href = "/game/" + response["roomID"];
});

document.getElementById("join").addEventListener("click", async () => {
	const nick = document.getElementById("nick").value;
	sessionStorage.setItem("userNick", nick);

	const roomID = document.getElementById("roomID").value;

	let response = await (
		await fetch(`/joinRoom/${roomID}`, {
			method: "get",
		})
	).json();

	sessionStorage.setItem("userUUID", response["userUUID"]);

	window.location.href = "/game/" + response["roomID"];
});
