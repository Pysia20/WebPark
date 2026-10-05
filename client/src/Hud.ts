import { coordinator } from "./Coordinator";
import {Application, Container, Graphics, Sprite, Text as PixiText, Texture, Ticker} from "pixi.js";


class Hud {
    hudContainer!: Container
    code!: PixiText
    players!: PixiText
    nick!: PixiText
    infoBackgroundTop: Sprite = new Sprite(Texture.WHITE)
    infoBackgroundBottom: Sprite = new Sprite(Texture.WHITE)
    fader: Graphics = new Graphics()

    init(hudContainer: Container, screenWidth: number, screenHeight: number) {
        this.fader.rect(0, 0, screenWidth, screenHeight).fill({color: "#000000", alpha: 1})

        const code = sessionStorage.getItem("roomID") as string
        const nick = sessionStorage.getItem("userName") as string

        this.code = new PixiText({text: code, style: {fill: "#4f4f4f", fontSize: 24}, resolution: 2})
        this.nick = new PixiText({text: nick, style: {fill: "#4f4f4f", fontSize: 24}, resolution: 2})
        this.players = new PixiText({text: "Players: " + coordinator.players.size.toString(), style: {fill: "#4f4f4f", fontSize: 24}, resolution: 2})
        this.hudContainer = hudContainer

        const padding = 5
        this.code.position.set(0 + padding,0 + padding)
        this.players.position.set(0 + padding, this.code.height + padding)
        this.nick.anchor.set(0,1)
        this.nick.position.set(0 + padding, screenHeight - padding)

        this.infoBackgroundTop.position.set(0, 0)
        this.infoBackgroundTop.width = Math.max(this.code.width, this.players.width) + (padding * 2)
        this.infoBackgroundTop.height = (this.code.height + this.players.height) + (padding * 2)
        this.infoBackgroundBottom.anchor.set(0,1)
        this.infoBackgroundBottom.position.set(0, screenHeight)
        this.infoBackgroundBottom.width = this.nick.width + (padding * 2)
        this.infoBackgroundBottom.height = this.nick.height + (padding * 2)

        this.hudContainer.addChild(this.infoBackgroundTop)
        this.hudContainer.addChild(this.infoBackgroundBottom)
        this.hudContainer.addChild(this.code)
        this.hudContainer.addChild(this.players)
        this.hudContainer.addChild(this.nick)
        this.hudContainer.addChild(this.fader)
    }

    updateHud() {
        this.players.text = "Players: " + coordinator.players.size
    }

    fadeIn(app: Application) {
        const tempFade = (time: Ticker) => {
            this.fader.alpha -= 0.015 * time.deltaTime

            if (this.fader.alpha <= 0) {
                this.hudContainer.removeChild(this.fader)
                app.ticker.remove(tempFade)
            }
        }

        app.ticker.add(tempFade)
    }
}

export const hud = new Hud()