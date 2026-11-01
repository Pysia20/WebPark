/** @type {import("socket.io-client").Socket} */
const socket = io("/debug", {
	path: "/socket",
});

const template = document.getElementById("cardTemplate");
const gamesDiv = document.getElementById("games");

function onCardClick() {
	const roomID = this.getAttribute("roomID");

	window.location.href = `/${roomID}`;
}

function addCard(gameData) {
	const card = document.createElement("div");
	card.classList.add("gameCard");
	card.innerHTML = template.innerHTML;

	card.children[0].textContent = "Room ID: " + gameData["roomID"];
	card.children[1].textContent = "Level ID: " + gameData["levelID"];

	card.setAttribute("roomID", gameData["roomID"]);
	card.setAttribute("levelID", gameData["levelID"]);

	card.addEventListener("click", onCardClick);

	gamesDiv.appendChild(card);
}

// for (let i = 0; i < 30; i++) {
// 	addCard({ roomID: "TEST12", levelID: "21TSET" });
// }

async function getData() {
	const response = await (
		await fetch("http://localhost:3006/games", {
			method: "get",
		})
	).json();

	for (const [key, value] of Object.entries(response)) {
		addCard({ roomID: key, levelID: value.levelID });
	}
}

getData();
