import * as PIXI from 'pixi.js'

import { Player } from "./Player"
import { getCurrentInputs } from "./Inputs"
import { emitInputs, getPlayerData } from "./Network";
import { Coordinator } from "./Coordinator";
import {ClientData, ServerData, ServerPlayerData} from "../../shared/commonModels"

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

let dataToSend: ClientData = {inputs: getCurrentInputs()}
const coordinator: Coordinator = new Coordinator(playerPlaceholder, app)

setInterval(() => emitInputs(dataToSend), (1000 / 20)) //(1000/20)=20 times a second, (1000/30)=30 times a second etc

const testSingleData: ServerPlayerData[] = [{playerId: 0, pos: {x: 10.0, y: 10.0}, velocity: {x: 0.0, y: 0.0}}, {playerId: 1, pos: {x: 20.0, y: 20.0}, velocity: {x: 0.0, y: 0.0}}] //TEMP
const testData: ServerData = {playerData: testSingleData} //TEMP
    app.ticker.add((time) => {

    coordinator.update_players(testData)
    coordinator.update_positions()

    testData.playerData[0].pos.x += 1.0 //TEMP
    testData.playerData[1].pos.y += 1.0 //TEMP

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