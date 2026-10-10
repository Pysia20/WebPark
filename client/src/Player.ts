import {Sprite, Texture, Text as PixiText, Container, Graphics} from "pixi.js";
import { Vector2 } from "@shared/commonModels"
import { PlayerTextures } from "./Assets";
import { playJump } from "./Audio";
import { PLAYER_CONFIG } from "@shared/commonVariables";

class Leg {
    stepStart: Vector2 = {x: 0, y: 0}
    footPos: Vector2 = {x: 0, y: 0}
    stepTarget: Vector2 = {x: 0, y: 0}
    hipPos: Vector2 = {x: 0, y: 0}
    stepProgress: number = 1.0
    isStepping: boolean = false
    leg: Graphics = new Graphics()
    prevGround: number = 0

    MAX_STRETCH = 24

    constructor() {
        this.leg.position.set(0, 0)
    }

    updateLeg(hip: Vector2, otherLeg: Leg, velocity: Vector2, ground: number, deltaTime: number) {
        const distance = Math.abs(hip.x - this.footPos.x)
        this.hipPos = hip

        if (this.prevGround != ground) {
            this.footPos.y = ground
            this.prevGround = ground
        }

        if (!this.isStepping && !otherLeg.isStepping && distance > this.MAX_STRETCH) {
            this.isStepping = true
            this.stepProgress = 0
            this.stepStart = {x: this.footPos.x, y: this.footPos.y}
            const fowardOffset = (velocity.x > 0) ? 16 : -16
            this.stepTarget = {x: hip.x + fowardOffset, y: ground}
        }


        if (this.isStepping) {
            this.stepProgress += 0.15 * deltaTime

            if (this.stepProgress >= 1.0) {
                this.stepProgress = 1.0
                this.isStepping = false
                this.footPos = {x: this.stepTarget.x, y: this.stepTarget.y}
            } else {
                this.footPos.x = this.stepStart.x + (this.stepTarget.x - this.stepStart.x) * this.stepProgress
                const liftArc = Math.sin(this.stepProgress * Math.PI) * 8
                this.footPos.y = ground - liftArc
            }
        }

        this.leg.clear().moveTo(this.hipPos.x, this.hipPos.y - 2).lineTo(this.footPos.x, this.footPos.y).stroke({ color: "#000000", width: 3, cap: "round" });
    }

    curlUp(orgin: Vector2) {
        this.hipPos = orgin
        this.footPos.x = this.hipPos.x
        this.footPos.y = this.hipPos.y + (PLAYER_CONFIG.HEIGHT / 30)
        this.isStepping = false
        this.stepProgress = 1.0

        this.leg.clear().moveTo(this.hipPos.x, this.hipPos.y - 2).lineTo(this.footPos.x, this.footPos.y).stroke({color: "#000000", width: 3, cap: "round"})
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
    velocity: Vector2 = {x: 0, y: 0}

    inAir: boolean = false
    deltaT: number = 0

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
        this.checkInAir(this.velocity)

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
            const hipLeft = { x: this.pos.x + legOffsetX, y: this.pos.y + legOffsetY };
            const hipRight = {x: this.pos.x + legOffsetX * 3, y: this.pos.y + legOffsetY}

            const ground = this.pos.y + PLAYER_CONFIG.HEIGHT
            this.legs[0].updateLeg(hipLeft, this.legs[1], this.velocity, ground, this.deltaT)
            this.legs[1].updateLeg(hipRight, this.legs[0], this.velocity, ground, this.deltaT)
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

    updateData(velocity: Vector2, deltaTime: number) {
        this.deltaT = deltaTime
        this.velocity = velocity
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