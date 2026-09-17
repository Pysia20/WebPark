import {Sprite, Texture} from "pixi.js";
import { Vector2 } from "../../shared/commonModels"

export class Player {
    id: number
    pos: Vector2 = {x: 0.0, y: 0.0}
    targetPos: Vector2 = {x: 0.0, y: 0.0}
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
        this.pos.x += (this.targetPos.x - this.pos.x) * this.LERP_SPEED
        this.pos.y += (this.targetPos.y - this.pos.y) * this.LERP_SPEED
        this.sprite.position.set(this.pos.x,this.pos.y)
    }
}