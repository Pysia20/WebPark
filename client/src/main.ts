import * as PIXI from 'pixi.js'

import { Player } from "./Player"
import { getCurrentInputs } from "./Inputs"
import { emitInputs, getPlayerData } from "./Network";
import { Coordinator } from "./Coordinator";
import { ClientData, ServerData } from "../../shared/commonModels"

const app = new PIXI.Application()
await app.init({
    width: 1280,
    height: 720,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    backgroundColor: 0x222222
})
document.body.appendChild(app.canvas)

const playerPlaceholder: PIXI.Texture = await PIXI.Assets.load("/public/sprites/playerPlaceholder.png") //TEMP
const tempPlayer: Player = new Player(0, "#000000", playerPlaceholder) //TEMP
app.stage.addChild(tempPlayer.sprite) //TEMP

let dataToSend: ClientData = {inputs: getCurrentInputs()}
const coordinator: Coordinator = new Coordinator(getPlayerData(), playerPlaceholder)

setInterval(() => emitInputs(dataToSend), (1000 / 20)) //(1000/20)=20 times a second, (1000/30)=30 times a second etc

app.ticker.add((time) => {
    coordinator.update_players(getPlayerData())
    coordinator.update_positions()

    /*
    tempPlayer.updatePos()
    if (getCurrentInputs()["right"]) { //TEMP
        tempPlayer.targetPos.x += 2
    }
    if (getCurrentInputs()["left"]) { //TEMP
        tempPlayer.targetPos.x -= 2
    }
    if (getCurrentInputs()["jump"]) { //TEMP
        tempPlayer.targetPos.y -= 10
    }
    if (tempPlayer.pos.y < app.stage.height) { //TEMP
        tempPlayer.targetPos.y += 10
        console.log(app.stage.height)
    }
     */
})