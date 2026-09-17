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
			body: JSON.stringify({
				nick: nick,
			}),
		})
	).json();

	sessionStorage.setItem("userUUID", response["userUUID"]);

	window.location.href = "/game/" + response["roomID"];
});
