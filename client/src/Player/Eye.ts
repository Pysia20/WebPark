import {Graphics} from "pixi.js";
import {Vector2} from "@shared/commonModels";
import {PLAYER_CONFIG, PLAYER_VISUAL_CONFIG} from "@shared/commonVariables";
import {Directions, States} from "./PlayerEnums";
import {getCurrentMousePos, isClicking} from "../Inputs";
export class Eye {
    eye: Graphics = new Graphics()
    isMe: boolean

    direction: Directions = Directions.None
    pos: Vector2 = {x: 0, y: 0}
    target: Vector2 = {x: 0, y: 0}
    lookOffset: Vector2 = {x: 0, y:0}

    isBlinking: boolean = false
    blinkTimer: number = PLAYER_VISUAL_CONFIG.BLINK_INTERVAL_BASE
    blinkState: States = States.Down

    width: number = PLAYER_VISUAL_CONFIG.EYE_STROKE_WIDTH
    length: number = PLAYER_VISUAL_CONFIG.EYE_MAX_LENGTH
    highestWidth: number = 0
    lowestLength: number = 0
    currentMaxLength: number = PLAYER_VISUAL_CONFIG.EYE_MAX_LENGTH
    pushSquintLerp: number = 0.35

    LERP_SPEED: number = PLAYER_VISUAL_CONFIG.EYE_LERP

    constructor(isMe: boolean) {
        this.eye.position.set(0, 0)
        this.isMe = isMe
    }

    updateEye(pos: Vector2, velocity: Vector2, deltaT: number, rand: number, isPushing: boolean) {
        this.updateSquint(velocity, isPushing)
        this.updateBlink(pos, deltaT, rand)
        this.updatePos(pos, velocity)
        if (velocity.x == 0 && velocity.y == 0 && this.isMe) this.lookAtMouse()

        const baseX = this.pos.x + this.lookOffset.x;
        const baseY = this.pos.y + this.lookOffset.y;
        const targetX = this.target.x + this.lookOffset.x;
        const targetY = this.target.y + this.lookOffset.y;
        if (this.isBlinking && this.length < this.currentMaxLength / 2) {
            const width = ((this.width - this.highestWidth) - this.highestWidth) * -1
            const length = ((this.length - this.lowestLength) - this.lowestLength) * -1
            this.eye.clear().moveTo(baseX - (length / 2), (baseY + targetY) / 2).lineTo(baseX + (length / 2), (baseY + targetY) / 2).stroke({
                color: "#000000",
                width: width,
                cap: "square"
            })
        } else {
            this.eye.clear().moveTo(baseX, baseY).lineTo(targetX, targetY).stroke({
                color: "#000000",
                width: this.width,
                cap: "square"
            })
        }
    }

    updateSquint(velocity: Vector2, isPushing: boolean) {
        if (isPushing) {
            this.currentMaxLength += ((PLAYER_VISUAL_CONFIG.EYE_MAX_LENGTH * 0.4) - this.currentMaxLength) * this.pushSquintLerp
            this.pushSquintLerp += (0.025 - this.pushSquintLerp) * this.LERP_SPEED
        } else {
            const absVelocity: Vector2 = {x: Math.abs(velocity.x), y: Math.abs(velocity.y)}
            const squint = (absVelocity.y > PLAYER_CONFIG.MAX_HORIZONTAL_SPEED) ? (PLAYER_CONFIG.MAX_HORIZONTAL_SPEED / PLAYER_VISUAL_CONFIG.EYE_SQUINT) : Math.max(absVelocity.x / PLAYER_VISUAL_CONFIG.EYE_SQUINT, absVelocity.y / PLAYER_VISUAL_CONFIG.EYE_SQUINT)
            this.currentMaxLength += ((PLAYER_VISUAL_CONFIG.EYE_MAX_LENGTH - squint) - this.currentMaxLength) * this.LERP_SPEED
        }
    }

    updateBlink(pos: Vector2, deltaT: number, rand: number) {
        if (this.blinkTimer <= 0 && !this.isBlinking) {
            this.blinkState = States.Down
            this.isBlinking = true
            this.blinkTimer = PLAYER_VISUAL_CONFIG.BLINK_INTERVAL_BASE + rand
        } else {
            this.blinkTimer -= deltaT
        }

        if (this.isBlinking) {
            if (this.length > 0.0 && this.blinkState == States.Down) {
                this.length -= PLAYER_VISUAL_CONFIG.BLINK_SPEED * deltaT
                this.width += PLAYER_VISUAL_CONFIG.BLINK_WIDTH_SPEED * deltaT
                pos.y = pos.y + ((this.currentMaxLength - this.length) / 2)
            } else {
                this.blinkState = States.Up
            }

            if (this.length > this.currentMaxLength / 2) {
                this.highestWidth = this.width
                this.lowestLength = this.length
            }

            if (this.length < this.currentMaxLength && this.blinkState == States.Up) {
                this.length += PLAYER_VISUAL_CONFIG.BLINK_SPEED * deltaT
                this.width -= PLAYER_VISUAL_CONFIG.BLINK_WIDTH_SPEED * deltaT
                pos.y = pos.y + ((this.currentMaxLength - this.length) / 2)
            } else if (this.length >= this.currentMaxLength) {
                this.length = this.currentMaxLength
                this.isBlinking = false
                this.width = PLAYER_VISUAL_CONFIG.EYE_STROKE_WIDTH
            }
        } else {
            this.length = this.currentMaxLength
        }
    }

    updatePos(pos: Vector2, velocity: Vector2) {
        this.target.x = pos.x
        if (velocity.x < 0) {
            this.direction = Directions.Left
            this.target.x -= PLAYER_CONFIG.WIDTH * PLAYER_VISUAL_CONFIG.EYE_LOOK_OFFSET_RATIO
        } else if (velocity.x > 0) {
            this.direction = Directions.Right
            this.target.x += PLAYER_CONFIG.WIDTH * PLAYER_VISUAL_CONFIG.EYE_LOOK_OFFSET_RATIO
        } else {
            this.direction = Directions.None
        }

        const distX = Math.abs(this.target.x - this.pos.x)
        if (distX > PLAYER_VISUAL_CONFIG.EYE_SNAP_THRESHOLD) {
            this.pos.x += (this.target.x - this.pos.x) * this.LERP_SPEED
            this.target.x = this.pos.x
        } else {
            this.pos.x = this.target.x
        }

//        const distY = Math.abs(pos.y - this.pos.y) this is still very buggy bc of velocity so leaving it like this at least for now
        this.pos.y = pos.y
        this.target.y = this.pos.y + this.length
    }

    lookAtMouse() {
        const mousePos = getCurrentMousePos()
        if (mousePos.x == 0 && mousePos.y == 0) {
            this.lookOffset.x += (0 - this.lookOffset.x) * this.LERP_SPEED
            this.lookOffset.y += (0 - this.lookOffset.y) * this.LERP_SPEED
            return;
        }

        const centerX = this.pos.x + (this.width / 2)
        const centerY = this.pos.y + (this.length / 2)

        const angle = Math.atan2(mousePos.y - centerY, mousePos.x - centerX)

        const targetX = Math.cos(angle) * PLAYER_VISUAL_CONFIG.EYE_X_LOOK
        const targetY = Math.sin(angle) * PLAYER_VISUAL_CONFIG.EYE_Y_LOOK

        this.lookOffset.x += (targetX - this.lookOffset.x) * this.LERP_SPEED
        this.lookOffset.y += (targetY - this.lookOffset.y) * this.LERP_SPEED

        if (isClicking()) {
            this.blinkTimer = 1
        }
    }
}