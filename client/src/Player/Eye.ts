import {Graphics} from "pixi.js";
import {Vector2} from "@shared/commonModels";
import {PLAYER_CONFIG, PLAYER_VISUAL_CONFIG} from "@shared/commonVariables";
import {Directions, States} from "./PlayerEnums";
import {getCurrentMousePos, isClicking} from "../Inputs";
import {lerpIt, lerpTheyThem} from "../FavoriteChild";

export class Eye {
    eye: Graphics = new Graphics()
    isMe: boolean

    pos: Vector2 = {x: 0, y: 0}
    target: Vector2 = {x: 0, y: 0}
    lookOffset: Vector2 = {x: 0, y: 0}
    pushOffset: Vector2 = {x: 0, y: 0}

    isBlinking: boolean = false
    blinkTimer: number = PLAYER_VISUAL_CONFIG.BLINK_INTERVAL_BASE
    blinkState: States = States.Down

    width: number = PLAYER_VISUAL_CONFIG.EYE_STROKE_WIDTH
    length: number = PLAYER_VISUAL_CONFIG.EYE_MAX_LENGTH
    highestWidth: number = 0
    lowestLength: number = 0
    currentMaxLength: number = PLAYER_VISUAL_CONFIG.EYE_MAX_LENGTH
    pushSquintLerp: number = PLAYER_VISUAL_CONFIG.EYE_PUSH_SQUINT_LERP_MAX

    LERP_SPEED: number = PLAYER_VISUAL_CONFIG.EYE_LERP

    constructor(isMe: boolean) {
        this.eye.position.set(0, 0)
        this.isMe = isMe
    }

    updateEye(pos: Vector2, velocity: Vector2, cursorPos: Vector2, deltaT: number, rand: number, isPushing: boolean, direction: Directions) {
        this.updateSquintAndPush(velocity, isPushing, direction)
        this.updateBlink(pos, deltaT, rand)
        this.updatePos(pos, velocity, isPushing, direction)
        if (velocity.x == 0 && velocity.y == 0) this.lookAtMouse(cursorPos)

        const baseX = this.pos.x + this.lookOffset.x + this.pushOffset.x
        const baseY = this.pos.y + this.lookOffset.y + this.pushOffset.y
        const targetX = this.target.x + this.lookOffset.x + this.pushOffset.x
        const targetY = this.target.y + this.lookOffset.y + this.pushOffset.y
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

    updateSquintAndPush(velocity: Vector2, isPushing: boolean, direction: Directions) {
        if (isPushing) {
            this.currentMaxLength = lerpIt(this.currentMaxLength, (PLAYER_VISUAL_CONFIG.EYE_MAX_LENGTH * PLAYER_VISUAL_CONFIG.EYE_PUSH_SQUINT), this.pushSquintLerp)
            this.pushSquintLerp = lerpIt(this.pushSquintLerp, PLAYER_VISUAL_CONFIG.EYE_PUSH_SQUINT_LERP_MIN, this.LERP_SPEED)

            this.pushOffset.x = direction * (PLAYER_CONFIG.WIDTH * PLAYER_VISUAL_CONFIG.EYE_PUSH_OFFSET_X)
            this.pushOffset.y =  PLAYER_CONFIG.HEIGHT * PLAYER_VISUAL_CONFIG.TORSO_HEIGHT_RATIO * PLAYER_VISUAL_CONFIG.EYE_PUSH_OFFSET_Y
        } else {
            const absVelocity: Vector2 = {x: Math.abs(velocity.x), y: Math.abs(velocity.y)}
            const squint = (absVelocity.y > PLAYER_CONFIG.MAX_HORIZONTAL_SPEED) ? (PLAYER_CONFIG.MAX_HORIZONTAL_SPEED / PLAYER_VISUAL_CONFIG.EYE_SQUINT) : Math.max(absVelocity.x / PLAYER_VISUAL_CONFIG.EYE_SQUINT, absVelocity.y / PLAYER_VISUAL_CONFIG.EYE_SQUINT)
            this.currentMaxLength = lerpIt(this.currentMaxLength, (PLAYER_VISUAL_CONFIG.EYE_MAX_LENGTH - squint), this.LERP_SPEED)

            this.pushSquintLerp = PLAYER_VISUAL_CONFIG.EYE_PUSH_SQUINT_LERP_MAX
            this.pushOffset.x = 0
            this.pushOffset.y = 0
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

    updatePos(pos: Vector2, velocity: Vector2, isPushing: boolean, direction: Directions) {
        this.pos.x = pos.x
        this.pos.y = pos.y
        this.target.x = this.pos.x
        this.target.y = this.pos.y + this.length

        let targetOffsetX = 0
        if (velocity.x == 0 && !isPushing) {
            targetOffsetX = 0
        } else {
            targetOffsetX = direction * PLAYER_CONFIG.WIDTH * PLAYER_VISUAL_CONFIG.EYE_LOOK_OFFSET_RATIO
        }

        const target: Vector2 = {x: targetOffsetX, y: 0}
        lerpTheyThem(this.lookOffset, target, this.LERP_SPEED)
    }

    lookAtMouse(cursorPos: Vector2) {
        const mousePos = (this.isMe) ? getCurrentMousePos() : cursorPos
        let target: Vector2 = {x: 0, y: 0}
        if (isClicking() && this.isMe) {
            this.blinkTimer = 1
        }

     //   console.log(this.isMe + ": " + cursorPos.x +"  "+cursorPos.y)

        if (mousePos.x == 0 && mousePos.y == 0) {
            lerpTheyThem(this.lookOffset, target, this.LERP_SPEED)
            return;
        }

        const centerX = this.pos.x + (this.width / 2)
        const centerY = this.pos.y + (this.length / 2)

        const angle = Math.atan2(mousePos.y - centerY, mousePos.x - centerX)

        target.x = Math.cos(angle) * PLAYER_VISUAL_CONFIG.EYE_X_LOOK
        target.y = Math.sin(angle) * PLAYER_VISUAL_CONFIG.EYE_Y_LOOK

        lerpTheyThem(this.lookOffset, target, this.LERP_SPEED)
    }
}