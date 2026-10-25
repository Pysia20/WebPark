import {Graphics} from "pixi.js";
import {Vector2} from "@shared/commonModels";
import {Directions} from "./PlayerEnums";

//can't rly test this rn
export class Arm {
    arm: Graphics = new Graphics()

    handPos: Vector2 = {x: 0, y: 0}
    touchTarget: Vector2 = {x: 0, y: 0}
    lbowPos: Vector2 = {x: 0, y: 0}
    shoulPos: Vector2 = {x: 0, y: 0}

    touchProgress: number = 1.0
    isReaching: boolean = false

    ARM_LENGTH: number = 20

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
            this.touchProgress += 0.3 * deltaTime
            const offset = (velocity.x > 0) ? this.ARM_LENGTH : -this.ARM_LENGTH
            this.touchTarget = {x: this.shoulPos.x + offset, y: this.shoulPos.y}

            if (this.touchProgress >= 1.0) {
                this.touchProgress = 1.0
                this.handPos = {x: this.touchTarget.x, y: this.touchTarget.y}
            } else {
                this.handPos.x = this.shoulPos.x + (this.touchTarget.x - this.shoulPos.x) * this.touchProgress
            }

            this.arm.moveTo(this.shoulPos.x, this.shoulPos.y).lineTo(this.handPos.x, this.handPos.y).stroke({
                color: "#000000",
                width: 4,
                cap: "round",
                join: "miter"
            });
        }
    }
}