import * as PIXI from 'pixi.js'

import { Player } from "./player"
import { getCurrentInputs } from "./inputs"

const app = new PIXI.Application()
await app.init({
    width: 1280,
    height: 720,
    backgroundColor: 0x222222
})
document.body.appendChild(app.canvas)

//Almost everything under this connect will be changed once I can connect to the server, the server handles inputs

const playerPlaceholder = await PIXI.Assets.load("/public/sprites/playerPlaceholder.png") //TEMP

const tempPlayer = new Player(0, {"r": 0,"g": 0,"b": 0}, playerPlaceholder) //TEMP

app.stage.addChild(tempPlayer.sprite) //TEMP

app.ticker.add((time) => {
    tempPlayer.updatePos()
    if (getCurrentInputs()["Right"]) { //TEMP
        tempPlayer.targetX += 2
        console.log("test")
    }
    if (getCurrentInputs()["Left"]) { //TEMP
        tempPlayer.targetX -= 2
        console.log("test")
    }
    if (getCurrentInputs()["Jump"]) {
        tempPlayer.targetY -= 10
    }
    if (tempPlayer.posY < app.stage.height) { //TEMP
        tempPlayer.targetY += 10
        console.log(app.stage.height)
        console.log(tempPlayer.targetY)
    }
})