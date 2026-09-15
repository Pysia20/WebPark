import {Sprite, Texture} from "pixi.js";

export class Player {
    id: number
    posX: number = 0.0
    posY: number = 0.0
    targetX: number = 0.0
    targetY: number = 0.0
    color: Record<string, number>
    sprite: Sprite
    isHost: boolean

    LERP_SPEED: number = 0.3

    constructor(id: number, color: Record<string, number>, texture: Texture) {
        this.id = id
        this.color = color
        this.isHost = (id == 0)

        this.sprite = new Sprite(texture)
        this.sprite.anchor.set(0.5)
    }

    updatePos() {
        this.posX += (this.targetX - this.posX) * this.LERP_SPEED
        this.posY += (this.targetY - this.posY) * this.LERP_SPEED
        this.sprite.position.set(this.posX,this.posY)
    }
}