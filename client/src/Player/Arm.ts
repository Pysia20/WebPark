import {Graphics} from "pixi.js";
import {Vector2} from "@shared/commonModels";
import {PLAYER_VISUAL_CONFIG} from "@shared/commonVariables";

export class Arm {
    arm: Graphics = new Graphics()

    handPos: Vector2 = {x: 0, y: 0}
    touchTarget: Vector2 = {x: 0, y: 0}
    lbowPos: Vector2 = {x: 0, y: 0}
    shoulPos: Vector2 = {x: 0, y: 0}

    touchProgress: number = 1.0
    isReaching: boolean = false

    ARM_LENGTH: number = PLAYER_VISUAL_CONFIG.ARM_LENGTH

    constructor() {
        this.arm.position.set(0, 0)
    }

    updateArm(shoul: Vector2, velocity: Vector2, deltaTime: number, isPushing: boolean) {
        this.shoulPos = shoul

        this.arm.clear()

        if (!isPushing) this.isReaching = false

        if (isPushing && !this.isReaching) {
            this.isReaching = true
            this.touchProgress = 0
            const offset = (velocity.x > 0) ? this.ARM_LENGTH : -this.ARM_LENGTH
            this.touchTarget = {x: this.shoulPos.x + offset, y: this.shoulPos.y}
            this.handPos.y = this.touchTarget.y
        }

        if (this.isReaching) {
            this.touchProgress += PLAYER_VISUAL_CONFIG.TOUCH_SPEED * deltaTime
            const offset = (velocity.x > 0) ? this.ARM_LENGTH * PLAYER_VISUAL_CONFIG.ARM_OFFSET : -this.ARM_LENGTH * PLAYER_VISUAL_CONFIG.ARM_OFFSET
            this.touchTarget = {x: this.shoulPos.x + offset, y: this.shoulPos.y}

            if (this.touchProgress >= 1.0) {
                this.touchProgress = 1.0
                this.handPos = {x: this.touchTarget.x, y: this.touchTarget.y}
            } else {
                this.handPos.x = this.shoulPos.x + (this.touchTarget.x - this.shoulPos.x) * this.touchProgress
            }

            this.invertTheKinematics()

            this.arm.moveTo(this.shoulPos.x, this.shoulPos.y).lineTo(this.lbowPos.x, this.lbowPos.y).lineTo(this.handPos.x, this.handPos.y).stroke({color: "#000000", width: PLAYER_VISUAL_CONFIG.ARM_WIDTH, cap: "round", join: "miter"});
        }
    }

    invertTheKinematics() {
        const straightDistance = Math.sqrt(((this.handPos.x - this.shoulPos.x) ** 2) + ((this.handPos.y - this.shoulPos.y) ** 2))
        if (straightDistance >= this.ARM_LENGTH) {
            this.lbowPos.x = (this.shoulPos.x + this.handPos.x) / 2
            this.lbowPos.y = (this.shoulPos.y + this.handPos.y) / 2
        } else {
            //Brain hurtsss, also yes AI helped with the math (sorry I didn't reinvent inverse kinematics)
            const scaryMath = ((this.ARM_LENGTH / 2) + (straightDistance ** 2) - (this.ARM_LENGTH / 2)) / (2 * (this.ARM_LENGTH / 2) * straightDistance)
            const clampedMath = Math.min(1, Math.max(-1, scaryMath))
            const angle = Math.acos(clampedMath)

            const baseAngle = Math.atan2(this.handPos.y - this.shoulPos.y, this.handPos.x - this.shoulPos.x)
            const kneeAngle = baseAngle + angle
            this.lbowPos.x = this.shoulPos.x + Math.cos(kneeAngle) * (this.ARM_LENGTH / 2)
            this.lbowPos.y = this.shoulPos.y + Math.sin(kneeAngle) * (this.ARM_LENGTH / 2)
        }
    }
}