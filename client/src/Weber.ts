import { emitReady, onGameStart } from "./Network";
import { Application } from "pixi.js";

export function pageSetup(app: Application) {
    const readyButton = document.getElementById("readyButton") as HTMLButtonElement
    const container = document.querySelector(".container") as HTMLDivElement
    const roomIdDisplay = document.getElementById("roomID") as HTMLHeadingElement
    let isReady = false
    roomIdDisplay.innerText = sessionStorage.getItem("roomID") ?? "NOT IN A ROOM"
    onGameStart(() => {
        app.canvas.classList.remove("hidden")
        container.classList.add("hidden")
    })
    readyButton.addEventListener("click", () => {
        isReady = !isReady
        readyButton.innerText = isReady ? "READY" : "NOT READY"
        emitReady(isReady)
    })
}