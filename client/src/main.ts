import * as PIXI from 'pixi.js'

import { getCurrentInputs } from "./Inputs"
import { emitInputs, getPlayerData, startNetworking } from "./Network";
import { coordinator } from "./Coordinator";
import { PlayerInputs, Vector2 } from "@shared/commonModels"
import { loadAssets } from "./Assets";
import { CameraController } from "./Camera";
import { levelManager } from "./Leveler";
import { pageSetup } from "./Weber";
import { hud } from "./Hud";

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
const hudContainer = new PIXI.Container()
app.stage.addChild(worldContainer)
app.stage.addChild(hudContainer)

pageSetup(app)

const assets = await loadAssets()
const leveler = new levelManager(worldContainer, assets.mapAssets.spritesheet, assets.mapAssets.levels, assets.mapAssets.entTextures)
const map_size: Vector2 = {x: leveler.mapData.pxWid, y: leveler.mapData.pxHei}
const camera = new CameraController(worldContainer, app.screen, map_size)

hud.init(hudContainer, app.screen.height)
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

leveler.renderLevel()
app.ticker.add((time) => {
    const serverPlayerData = getPlayerData()
    if (serverPlayerData) {
        coordinator.update_players(serverPlayerData, time.deltaTime)
        camera.update_cam(serverPlayerData)
    }
    coordinator.update_positions()
})