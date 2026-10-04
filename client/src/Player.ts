import { Sprite, Texture, Text as PixiText } from "pixi.js";
import { Vector2 } from "@shared/commonModels"
import { PlayerTextures } from "./Assets";
import { playJump } from "./Audio";
import { PLAYER_CONFIG } from "@shared/commonVariables";

interface animController {
    ANIM_SPEED: number
    animTimer: number
    animFrames: Texture[]
}

export class Player {
    id: number
    isHost: boolean
    nick: PixiText
    color: string
    sprite: Sprite
    textures: PlayerTextures = {} as PlayerTextures
    walkingAnim: animController
    pos: Vector2 = {x: 0.0, y: 0.0}
    prevVelocity: Vector2 = {x: 0.0, y: 0.0}
    targetPos: Vector2 = {x: 0.0, y: 0.0}

    LERP_SPEED: number = 0.3


    constructor(id: number, color: string, textures: PlayerTextures, nick: PixiText) {
        this.id = id
        this.color = color
        this.isHost = (id == 0)
        this.textures = textures
        this.sprite = new Sprite(textures.idle)
        this.sprite.anchor.set(0.5, 0.0)
        this.sprite.tint = color
        this.sprite.setSize(PLAYER_CONFIG.WIDTH, PLAYER_CONFIG.HEIGHT)
        this.walkingAnim = {ANIM_SPEED: 0.1, animFrames: [this.textures.idle, this.textures.walk], animTimer: 0}
        this.nick = nick
    }

    updatePos() {
        this.pos.x += (this.targetPos.x - this.pos.x) * this.LERP_SPEED
        this.pos.y += (this.targetPos.y - this.pos.y) * this.LERP_SPEED
        this.sprite.position.set(
            this.pos.x + PLAYER_CONFIG.WIDTH / 2,
            this.pos.y
        )
        this.nick.position.set(
            this.pos.x + PLAYER_CONFIG.WIDTH / 2,
            this.pos.y
        )
    }

    updateSprite(velocity: Vector2, deltaTime: number) {
        this.walkingAnim.animTimer += this.walkingAnim.ANIM_SPEED * deltaTime
        if (velocity.x < 0) {
            this.sprite.scale.x = -(PLAYER_CONFIG.WIDTH / this.textures.idle.width)
            this.sprite.texture = this.walkingAnim.animFrames[Math.floor(this.walkingAnim.animTimer) % this.walkingAnim.animFrames.length]
        } else if (velocity.x > 0) {
            this.sprite.scale.x = (PLAYER_CONFIG.WIDTH / this.textures.idle.width)
            this.sprite.texture = this.walkingAnim.animFrames[Math.floor(this.walkingAnim.animTimer) % this.walkingAnim.animFrames.length]
        } else {
            this.sprite.texture = this.textures.idle
        }
         if (velocity.y != 0) {
             this.sprite.texture = this.textures.jump
         } else if (this.sprite.texture == this.textures.jump) {
             this.sprite.texture = this.textures.idle
         }

        this.checkIfJumped(velocity)
        this.prevVelocity = velocity
    }

    checkIfJumped(currentVelocity: Vector2) {
        if (currentVelocity.y < 0 && this.prevVelocity.y == 0) {
            playJump()
        }
    }
}