import {Graphics} from "pixi.js";
import {Vector2} from "@shared/commonModels";
import {PLAYER_CONFIG} from "@shared/commonVariables";
import {Directions, States} from "./PlayerEnums";

export class Eye {
    eye: Graphics = new Graphics()

    direction: Directions = Directions.None
    pos: Vector2 = {x: 0, y: 0}
    target: Vector2 = {x: 0, y: 0}

    isBlinking: boolean = false
    blinkTimer: number = 200
    blinkState: States = States.Down

    width: number = 5
    length: number
    highestWidth: number = 0
    lowestLength: number = 0

    LERP_SPEED: number = 0.25
    MAX_LENGTH: number = 16

    constructor() {
        this.eye.position.set(0, 0)
        this.length = this.MAX_LENGTH
    }

    updateEye(pos: Vector2, velocity: Vector2, deltaT: number, rand: number) {
        this.updateBlink(pos, deltaT, rand)
        this.updatePos(pos, velocity)

        if (this.isBlinking && this.length < this.MAX_LENGTH / 2) {
            const width = ((this.width - this.highestWidth) - this.highestWidth) * -1
            const length = ((this.length - this.lowestLength) - this.lowestLength) * -1
            this.eye.clear().moveTo(this.pos.x - (length / 2), (this.pos.y + this.target.y) / 2).lineTo(this.pos.x + (length / 2), (this.pos.y + this.target.y) / 2).stroke({
                color: "#000000",
                width: width,
                cap: "square"
            })
        } else {
            this.eye.clear().moveTo(this.pos.x, this.pos.y).lineTo(this.target.x, this.target.y).stroke({
                color: "#000000",
                width: this.width,
                cap: "square"
            })
        }
    }

    updateBlink(pos: Vector2, deltaT: number, rand: number) {
        if (this.blinkTimer <= 0 && !this.isBlinking) {
            this.blinkState = States.Down
            this.isBlinking = true
            this.blinkTimer = 300 + rand
        } else {
            this.blinkTimer -= deltaT
        }

        if (this.isBlinking) {
            if (this.length > 0.0 && this.blinkState == States.Down) {
                this.length -= 2.5 * deltaT
                this.width += 0.5 * deltaT
                pos.y = pos.y + ((this.MAX_LENGTH - this.length) / 2)
            } else {
                this.blinkState = States.Up
            }

            if (this.length > this.MAX_LENGTH / 2) {
                this.highestWidth = this.width
                this.lowestLength = this.length
            }

            if (this.length < this.MAX_LENGTH && this.blinkState == States.Up) {
                this.length += 2.5 * deltaT
                this.width -= 0.5 * deltaT
                pos.y = pos.y + ((this.MAX_LENGTH - this.length) / 2)
            } else if (this.length >= this.MAX_LENGTH) {
                this.length = this.MAX_LENGTH
                this.isBlinking = false
                this.width = 5
            }
        }
    }

    updatePos(pos: Vector2, velocity: Vector2) {
        this.target.x = pos.x
        if (velocity.x < 0) {
            this.direction = Directions.Left
            this.target.x -= PLAYER_CONFIG.WIDTH / 10
        } else if (velocity.x > 0) {
            this.direction = Directions.Right
            this.target.x += PLAYER_CONFIG.WIDTH / 10
        } else {
            this.direction = Directions.None
        }

        const distX = Math.abs(this.target.x - this.pos.x)
        if (distX > 3) {
            this.pos.x += (this.target.x - this.pos.x) * this.LERP_SPEED
            this.target.x = this.pos.x
        } else {
            this.pos.x = this.target.x
        }

//        const distY = Math.abs(pos.y - this.pos.y) this is still very buggy bc of velocity so leaving it like this at least for now
        this.pos.y = pos.y
        this.target.y = this.pos.y + this.length
    }
}