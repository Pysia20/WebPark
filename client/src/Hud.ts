import { coordinator } from "./Coordinator";
import { Container, Text as PixiText } from "pixi.js";
import {Player} from "./Player";
import {ServerData} from "@shared/commonModels";
import {PlayerTextures} from "./Assets";


class Hud {
    hudContainer!: Container
    code!: PixiText
    players!: PixiText
    nick!: PixiText

    init(hudContainer: Container, screenHeight: number) {
        const code = sessionStorage.getItem("roomID") as string
        const nick = sessionStorage.getItem("userName") as string                  //    const nick: PixiText = new PixiText({text: data.nick, style: {fill: nickColor.toHex() ?? "#ffffff", fontSize: 12}, resolution: 2})

        this.code = new PixiText({text: code, style: {fill: "#d2d2d2", fontSize: 24}, resolution: 2})
        this.nick = new PixiText({text: nick, style: {fill: "#d2d2d2", fontSize: 24}, resolution: 2})
        this.players = new PixiText({text: "Players: " + coordinator.players.size.toString(), style: {fill: "#d2d2d2", fontSize: 24}, resolution: 2})
        this.hudContainer = hudContainer

        const padding = 5
        this.code.position.set(0 + padding,0 + padding)
        this.players.position.set(0 + padding, this.code.height + padding)
        this.nick.anchor.set(0,1)
        this.nick.position.set(0 + padding, screenHeight - padding)

        this.hudContainer.addChild(this.code)
        this.hudContainer.addChild(this.players)
        this.hudContainer.addChild(this.nick)
    }

    updateHud() {
        this.players.text = "Players: " + coordinator.players.size
    }
}

export const hud = new Hud()