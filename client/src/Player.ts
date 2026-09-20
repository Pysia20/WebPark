import * as PIXI from "pixi.js";

import { Sprite } from "pixi.js";
import { Vector2 } from "../../shared/commonModels"
import { PlayerTextures } from "./Assets";
import { playJump } from "./Audio";

interface PlayerSprites {
    idle: PIXI.Sprite
    walk: PIXI.Sprite
    jump: PIXI.Sprite
}

export class Player {
    id: number
    pos: Vector2 = {x: 0.0, y: 0.0}
    prevVelocity: Vector2 = {x: 0.0, y: 0.0}
    targetPos: Vector2 = {x: 0.0, y: 0.0}
    color: string
    sprite: Sprite
    sprites: PlayerSprites = {} as PlayerSprites
    isHost: boolean

    LERP_SPEED: number = 0.3

    constructor(id: number, color: string, textures: PlayerTextures) {
        this.id = id
        this.color = color
        this.isHost = (id == 0)

        for (const texture in textures) {
            const sprite = new Sprite(textures[texture as keyof PlayerTextures])
            sprite.anchor.set(0.5, 1.0)
            sprite.tint = this.color
            this.sprites[texture as keyof PlayerTextures] = sprite
        }
        this.sprite = this.sprites.idle
    }

    updatePos() {
        this.pos.x += (this.targetPos.x - this.pos.x) * this.LERP_SPEED
        this.pos.y += (this.targetPos.y - this.pos.y) * this.LERP_SPEED
        this.sprite.position.set(this.pos.x,this.pos.y)
    }

    updateDirection(velocity: Vector2) {
        if (velocity.x < 0) {
            this.sprite.scale.x = -1
        } else if (velocity.x > 0) {
            this.sprite.scale.x = 1
        }
        if (velocity.y != 0) {
            this.sprite = this.sprites.jump
        } else if (this.sprite == this.sprites.jump) {
            this.sprite = this.sprites.idle
        }

        this.checkIfJumped(velocity)
    }

    checkIfJumped(currentVelocity: Vector2) {
        if (currentVelocity.y < 0 && this.prevVelocity.y == 0) {
            playJump()
        }
    }
}