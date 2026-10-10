import {Sprite, Texture, Text as PixiText, Container, Graphics} from "pixi.js";
import { Vector2 } from "@shared/commonModels"
import { PlayerTextures } from "./Assets";
import { playJump } from "./Audio";
import { PLAYER_CONFIG } from "@shared/commonVariables";

enum LegSide {
    left,
    right
}

class Leg {
    orginPos: Vector2
    footPos: Vector2
    leg: Graphics = new Graphics()

    STEP_SPACER = 20

    constructor() {
        this.orginPos = {x: 0, y: 0}
        this.footPos = {x: 0, y: 0}
        this.leg.position.set(0, 0)
    }

    updateLegs(orgin: Vector2, canStep: boolean) {
        this.orginPos = orgin
        let stepped = false

        if (Math.abs(this.orginPos.x - this.footPos.x) > this.STEP_SPACER && canStep) {
            stepped = true
            this.footPos.x = (this.orginPos.x > this.footPos.x) ? this.orginPos.x + this.STEP_SPACER : this.orginPos.x - this.STEP_SPACER
        }
        this.footPos.y = this.orginPos.y + (PLAYER_CONFIG.HEIGHT / 10)
        // if (Math.abs(this.orginPos.y - this.footPos.y) > (PLAYER_CONFIG.HEIGHT / 10)) this.footPos.y = this.orginPos.y + (PLAYER_CONFIG.HEIGHT / 10)

        this.leg.clear().moveTo(this.orginPos.x, this.orginPos.y - 2).lineTo(this.footPos.x, this.footPos.y).stroke({color: "#000000", width: 3, cap: "round"})

        return stepped
    }

    curlUp(orgin: Vector2) {
        this.orginPos = orgin
        this.footPos.x = this.orginPos.x
        this.footPos.y = this.orginPos.y + (PLAYER_CONFIG.HEIGHT / 30)

        this.leg.clear().moveTo(this.orginPos.x, this.orginPos.y - 2).lineTo(this.footPos.x, this.footPos.y).stroke({color: "#000000", width: 3, cap: "round"})
    }
}

class Torso {
    color: string
    sprite: Sprite

    constructor(texture: Texture, color: string) {
        this.color = color
        this.sprite = new Sprite(texture)
        this.sprite.setSize(PLAYER_CONFIG.WIDTH, PLAYER_CONFIG.HEIGHT - (PLAYER_CONFIG.HEIGHT / 10))
    }
}

class Eye {
    pos: Vector2

    constructor() {
        this.pos = {x: 0, y: 0}
    }
}

export class Player {
    id: number
    isHost: boolean
    nick: PixiText
    color: string
    pos: Vector2 = {x: 0.0, y: 0.0}
    targetPos: Vector2 = {x: 0.0, y: 0.0}
    inAir: boolean = false
    activeLeg: LegSide = LegSide.left

    legs: Leg[]
    torso: Torso
    eyes: Eye[]

    LERP_SPEED: number = 0.3

    constructor(id: number, color: string, nick: PixiText, textures: PlayerTextures) {
        this.id = id
        this.color = color
        this.isHost = (id == 0)
        this.nick = nick
        this.torso = new Torso(textures.torso, color)
        this.eyes = [new Eye(), new Eye()]

        const legOffset = PLAYER_CONFIG.WIDTH / 4
        this.legs = [new Leg(), new Leg()]
    }

    addToWorld(world: Container) {
        world.addChild(this.torso.sprite)
        world.addChild(this.nick)
        world.addChild(this.legs[0].leg)
        world.addChild(this.legs[1].leg)
    }

    updatePos() {
        this.pos.x += (this.targetPos.x - this.pos.x) * this.LERP_SPEED
        this.pos.y += (this.targetPos.y - this.pos.y) * this.LERP_SPEED
        this.updateTorso()
        this.updateNick()
        this.updateLegs()

    }

    updateNick() {
        this.nick.position.set(
            this.pos.x + PLAYER_CONFIG.WIDTH / 2,
            this.pos.y
        )
    }

    updateTorso() {
        this.torso.sprite.position.set(
            this.pos.x,
            this.pos.y
        )
    }

    updateLegs() {
        const legOffsetX = PLAYER_CONFIG.WIDTH / 4
        const legOffsetY = (PLAYER_CONFIG.HEIGHT / 10) * 9

        if (!this.inAir) {
            const leftStepped = this.legs[0].updateLegs({x: this.pos.x + legOffsetX, y: this.pos.y + legOffsetY}, (this.activeLeg == LegSide.left))
            const rightStepped = this.legs[1].updateLegs({x: this.pos.x + (legOffsetX * 3), y: this.pos.y + legOffsetY}, (this.activeLeg == LegSide.right))

            if (leftStepped) {
                this.activeLeg = LegSide.right
            } else if (rightStepped) {
                this.activeLeg = LegSide.left
            }
        } else {
            this.legs[0].curlUp({x: this.pos.x + legOffsetX, y: this.pos.y + legOffsetY})
            this.legs[1].curlUp({x: this.pos.x + (legOffsetX * 3), y: this.pos.y + legOffsetY})
        }
    }

    updateSprtie() {
        console.log("nope")
    }

    checkInAir(velocity: Vector2) {
        this.inAir = (velocity.y != 0)
    }

    beGone(world: Container) {
        world.removeChild(this.nick)
        world.removeChild(this.torso.sprite)
        world.removeChild(this.legs[0].leg)
        world.removeChild(this.legs[1].leg)
    }
}

/*
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
 */