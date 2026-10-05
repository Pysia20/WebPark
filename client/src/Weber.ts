import { emitReady, onGameStart, onPlayerJoin, onPlayerLeave, onReadyUpdate } from "./Network";
import { Application } from "pixi.js";
import { coordinator } from "./Coordinator";

export function pageSetup(app: Application) {
    const readyButton = document.getElementById("readyButton") as HTMLButtonElement
    const container = document.querySelector(".container") as HTMLDivElement
    const roomIdDisplay = document.getElementById("roomID") as HTMLHeadingElement
    const connectedCount = document.getElementById("connectedCount") as HTMLHeadingElement
    let currentPlayers: number = 0
    let readyPlayers: number = 0

    roomIdDisplay.innerText = sessionStorage.getItem("roomID") ?? "NOT IN A ROOM"

    let isReady = false
    onGameStart(() => {
        app.canvas.classList.remove("hidden")
        container.classList.add("hidden")
    })
    onPlayerJoin(() => {
        currentPlayers = coordinator.players.size
        connectedCount.innerHTML = "READY: " + readyPlayers + "/" + currentPlayers
    })
    onPlayerLeave(() => {
        currentPlayers = coordinator.players.size
        connectedCount.innerHTML = "READY: " + readyPlayers + "/" + currentPlayers
    })
    onReadyUpdate((readys) => {
        readyPlayers = readys
        connectedCount.innerHTML = "READY: " + readyPlayers + "/" + currentPlayers
    })
    readyButton.addEventListener("click", () => {
        isReady = !isReady
        readyButton.innerText = isReady ? "READY" : "NOT READY"
        emitReady(isReady)
    })
}