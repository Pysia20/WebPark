import {Container, Text as PixiText} from "pixi.js";
import {Vector2} from "@shared/commonModels"
import {PlayerTextures} from "../Assets";
import {playJump} from "../Audio";
import {PLAYER_CONFIG} from "@shared/commonVariables";
import {Leg} from "./Leg";
import {Torso} from "./Torso";
import {Eye} from "./Eye";

export class Player {
    id: number
    isHost: boolean

    nick: PixiText
    color: string

    pos: Vector2 = {x: 0.0, y: 0.0}
    targetPos: Vector2 = {x: 0.0, y: 0.0}
    velocity: Vector2 = {x: 0, y: 0}
    prevVelocity: Vector2 = {x: 0, y: 0}

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
        this.legs = [new Leg(), new Leg()]
    }

    addToWorld(world: Container) {
        world.addChild(this.torso.sprite)
        world.addChild(this.nick)
        world.addChild(this.legs[0].leg)
        world.addChild(this.legs[1].leg)
        world.addChild(this.eyes[0].eye)
        world.addChild(this.eyes[1].eye)
    }

    updatePos() {
        this.checkIfJumped()
        this.checkInAir()

        this.pos.x += (this.targetPos.x - this.pos.x) * this.LERP_SPEED
        this.pos.y += (this.targetPos.y - this.pos.y) * this.LERP_SPEED
        this.updateTorso()
        this.updateNick()
        this.updateLegs()
        this.updateEyes()

        this.prevVelocity = this.velocity
    }

    updateNick() {
        this.nick.position.set(
            this.pos.x + PLAYER_CONFIG.WIDTH / 2,
            this.pos.y
        )
    }

    updateTorso() {
        this.torso.updateTorso(this.pos, this.velocity)
    }

    updateLegs() {
        const legOffsetX = PLAYER_CONFIG.WIDTH / 4
        const legOffsetY = (PLAYER_CONFIG.HEIGHT / 10) * 9

        if (!this.inAir) {
            const hipLeft = {x: this.pos.x + legOffsetX, y: this.pos.y + legOffsetY};
            const hipRight = {x: this.pos.x + (legOffsetX * 3), y: this.pos.y + legOffsetY}

            const ground = this.pos.y + PLAYER_CONFIG.HEIGHT
            this.legs[0].updateLeg(hipLeft, this.legs[1], this.velocity, ground, this.deltaT)
            this.legs[1].updateLeg(hipRight, this.legs[0], this.velocity, ground, this.deltaT)
        } else {
            this.legs[0].curlUp({x: this.pos.x + legOffsetX, y: this.pos.y + legOffsetY}, this.velocity)
            this.legs[1].curlUp({x: this.pos.x + (legOffsetX * 3), y: this.pos.y + legOffsetY}, this.velocity)
        }
    }

    updateEyes() {
        const eyeOffsetX = PLAYER_CONFIG.WIDTH / 4
        const eyeOffsetY = (PLAYER_CONFIG.HEIGHT / 10) * 2

        const eyeLeft = {x: this.pos.x + eyeOffsetX, y: this.pos.y + eyeOffsetY}
        const eyeRight = {x: this.pos.x + (eyeOffsetX * 3), y: this.pos.y + eyeOffsetY}

        const rand = Math.floor(Math.random() * 500)

        this.eyes[0].updateEye(eyeLeft, this.velocity, this.deltaT, rand)
        this.eyes[1].updateEye(eyeRight, this.velocity, this.deltaT, rand)
    }

    checkInAir() {
        if (this.velocity.y != 0) {
            this.inAir = true
        } else if (this.prevVelocity.y > 0) {
            this.inAir = false
        }
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

    checkIfJumped() {
        if (this.velocity.y < 0 && this.prevVelocity.y == 0) {
            playJump()
        }
    }

    hide(shouldItho: boolean) {
        if (shouldItho) {
            this.torso.sprite.alpha = 0
            this.eyes[0].eye.alpha = 0
            this.eyes[1].eye.alpha = 0
            this.legs[0].leg.alpha = 0
            this.legs[1].leg.alpha = 0
            this.nick.alpha = 0
        } else {
            this.torso.sprite.alpha = 1
            this.eyes[0].eye.alpha = 1
            this.eyes[1].eye.alpha = 1
            this.legs[0].leg.alpha = 1
            this.legs[1].leg.alpha = 1
            this.nick.alpha = 1
        }
    }
}