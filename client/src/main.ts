import * as PIXI from 'pixi.js'
import { createMouseListiner, startSendingInputs } from "./Inputs"
import { getServerData, onConnect, startNetworking } from "./Network";
import { coordinator } from "./Coordinator";
import { Vector2 } from "@shared/commonModels"
import { loadAssets } from "./Assets";
import {cam, CameraController} from "./Camera";
import { leveler } from "./Leveler";
import { finishLoad, pageSetup } from "./Weber";
import { hud } from "./Hud";
import { updateShaders } from "./Shaders";
import { updateLerp } from "./FavoriteChild";

const app = new PIXI.Application()
await app.init({
    width: 1280,
    height: 720,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    antialias: true,
    backgroundColor: "#6A94B1"
})
app.stage.eventMode = "static"
app.stage.hitArea = app.screen
app.canvas.classList.add("hidden")
document.body.appendChild(app.canvas)

const worldContainer = new PIXI.Container()
const hudContainer = new PIXI.Container()
app.stage.addChild(worldContainer)
app.stage.addChild(hudContainer)
createMouseListiner(app, worldContainer)

const assets = await loadAssets()

pageSetup(app, assets.mapAssets.levels)

hud.init(hudContainer, app.screen.width, app.screen.height)
coordinator.init(assets.playerTextures, worldContainer)
leveler.init(worldContainer, assets.mapAssets.spritesheet, assets.mapAssets.levels, assets.mapAssets.entTextures)

const map_size: Vector2 = {x: leveler.mapData.pxWid, y: leveler.mapData.pxHei}
cam.init(worldContainer, app.screen, map_size)

onConnect(finishLoad)
startNetworking()
startSendingInputs()

leveler.renderLevel()
hud.fadeIn(app)
app.ticker.add((time) => {
    updateLerp(time.deltaTime)
    updateShaders(time.deltaTime)

    const serverData = getServerData()
    if (serverData) {
        coordinator.update_players(serverData.playerData, time.deltaTime)
        cam.update_cam(serverData)
        leveler.updateEnts(serverData.entityData, time.deltaTime)
    }
    coordinator.update_positions()
})