/** @type {import("socket.io-client").Socket} */
const socket = io("/debug", {
	path: "/socket",
});

const template = document.getElementById("cardTemplate");
const gamesDiv = document.getElementById("games");

for (let i = 0; i < 30; i++) {
	const card = document.createElement("div");
	card.classList.add("gameCard");
	card.innerHTML = template.innerHTML;

	gamesDiv.appendChild(card);
}
