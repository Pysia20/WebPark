import * as PIXI from 'pixi.js'

import { getCurrentInputs } from "./Inputs"
import { emitInputs, emitReady, getPlayerData, onGameStart, startNetworking } from "./Network";
import { coordinator } from "./Coordinator";
import { PlayerInputs } from "../../shared/commonModels"
import { loadAssets } from "./Assets";
import {cameraControler} from "./Camera";

const app = new PIXI.Application()
await app.init({
    width: 1280,
    height: 720,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    backgroundColor: 0x222222
})
app.canvas.classList.add("hidden")
document.body.appendChild(app.canvas)
const worldContainer = new PIXI.Container()
const uiContainer = new PIXI.Container()
app.stage.addChild(worldContainer)
app.stage.addChild(uiContainer)

const assets = await loadAssets()
const camera = new cameraControler(worldContainer, app.screen)

coordinator.init(assets.playerTextures, worldContainer)

startNetworking()

let previousSent: PlayerInputs = {left: false, jump: false, right: false}
let dataToSend: PlayerInputs = getCurrentInputs()
setInterval(() => {
    dataToSend = getCurrentInputs()
    if (previousSent.right !== dataToSend.right || previousSent.jump !== dataToSend.jump || previousSent.left !== dataToSend.left) {
        emitInputs(dataToSend)
        previousSent = dataToSend
    }
}, (1000 / 30)) //(1000/20)=20 times a second, (1000/30)=0 times a second etc

app.ticker.add((time) => {
    const serverPlayerData = getPlayerData()
    if (serverPlayerData) {
        coordinator.update_players(serverPlayerData)
        camera.update_cam(serverPlayerData)
    }
    coordinator.update_positions()
})

//HTML STUFF
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