import {Vector2} from "@shared/commonModels";
import {Graphics} from "pixi.js";
import {PLAYER_CONFIG, PLAYER_VISUAL_CONFIG} from "@shared/commonVariables";
import {Directions} from "./PlayerEnums";

export class Leg {
    leg: Graphics = new Graphics()

    stepStart: Vector2 = {x: 0, y: 0}
    footPos: Vector2 = {x: 0, y: 0}
    stepTarget: Vector2 = {x: 0, y: 0}
    hipPos: Vector2 = {x: 0, y: 0}
    kneePos: Vector2 = {x: 0, y: 0}

    stepProgress: number = 1.0
    isStepping: boolean = false
    prevGround: number = 0

    direction: Directions = Directions.Right

    LERP_SPEED: number = PLAYER_VISUAL_CONFIG.LEG_LERP
    LEG_LENGTH: number = PLAYER_CONFIG.HEIGHT * PLAYER_VISUAL_CONFIG.LEG_LENGTH_RATIO

    constructor() {
        this.leg.position.set(0, 0)
    }

    updateLeg(hip: Vector2, otherLeg: Leg, velocity: Vector2, ground: number, deltaTime: number) {
        const distance = Math.abs(hip.x - this.footPos.x)
        this.hipPos = hip

        this.updateDirection(velocity)

        if (this.prevGround != ground) {
            this.footPos.y = ground
            this.prevGround = ground
        }

        if (!this.isStepping && !otherLeg.isStepping && distance > PLAYER_VISUAL_CONFIG.LEG_MAX_STRETCH) {
            this.isStepping = true
            this.stepProgress = 0
            this.stepStart = {x: this.footPos.x, y: this.footPos.y}
            const fowardOffset = (velocity.x > 0) ? PLAYER_VISUAL_CONFIG.LEG_STEP : -PLAYER_VISUAL_CONFIG.LEG_STEP
            this.stepTarget = {x: hip.x + fowardOffset, y: ground}
        }

        if (this.isStepping) {
            this.stepProgress += PLAYER_VISUAL_CONFIG.LEG_STEP_SPEED * deltaTime

            if (this.direction == Directions.Left) {
                if (this.stepTarget.x > this.hipPos.x - (PLAYER_CONFIG.WIDTH * PLAYER_VISUAL_CONFIG.LEG_STEP_MIN_OFFSET_RATIO)) this.stepTarget.x -= (PLAYER_CONFIG.WIDTH * PLAYER_VISUAL_CONFIG.LEG_STEP_NUDGE_RATIO)
            } else if (this.direction == Directions.Right) {
                if (this.stepTarget.x < this.hipPos.x + (PLAYER_CONFIG.WIDTH * PLAYER_VISUAL_CONFIG.LEG_STEP_MIN_OFFSET_RATIO)) this.stepTarget.x += (PLAYER_CONFIG.WIDTH * PLAYER_VISUAL_CONFIG.LEG_STEP_NUDGE_RATIO)
            }
            if (this.stepProgress >= 1.0) {
                this.stepProgress = 1.0
                this.isStepping = false
                this.footPos = {x: this.stepTarget.x, y: this.stepTarget.y}
            } else {
                this.footPos.x = this.stepStart.x + (this.stepTarget.x - this.stepStart.x) * this.stepProgress
                const liftArc = Math.sin(this.stepProgress * Math.PI) * (PLAYER_CONFIG.HEIGHT * PLAYER_VISUAL_CONFIG.LEG_LIFT_RATIO)
                this.footPos.y = ground - liftArc
            }
        }

        this.invertTheKinematics()

        this.leg.clear().moveTo(this.hipPos.x, this.hipPos.y - PLAYER_VISUAL_CONFIG.HIP_TUCK).lineTo(this.kneePos.x, this.kneePos.y).lineTo(this.footPos.x, this.footPos.y).stroke({
            color: "#000000",
            width: PLAYER_VISUAL_CONFIG.LEG_STROKE_WIDTH,
            cap: "round",
            join: "miter"
        });
    }

    updateDirection(velocity: Vector2) {
        if (velocity.x != 0) {
            this.direction = (velocity.x > 0) ? Directions.Right : Directions.Left
        }
    }

    invertTheKinematics() {
        const straightDistance = Math.sqrt(((this.footPos.x - this.hipPos.x) ** 2) + ((this.footPos.y - this.hipPos.y) ** 2))
        if (straightDistance >= this.LEG_LENGTH) {
            this.kneePos.x = (this.hipPos.x + this.footPos.x) / 2
            this.kneePos.y = (this.hipPos.y + this.footPos.y) / 2
        } else {
            //Brain hurtsss, also yes AI helped with the math (sorry I didn't reinvent inverse kinematics)
            const scaryMath = ((this.LEG_LENGTH / 2) + (straightDistance ** 2) - (this.LEG_LENGTH / 2)) / (2 * (this.LEG_LENGTH / 2) * straightDistance)
            const clampedMath = Math.min(1, Math.max(-1, scaryMath))
            const angle = Math.acos(clampedMath)

            const baseAngle = Math.atan2(this.footPos.y - this.hipPos.y, this.footPos.x - this.hipPos.x)
            const kneeAngle = (this.direction == Directions.Right) ? baseAngle - angle : baseAngle + angle
            this.kneePos.x = this.hipPos.x + Math.cos(kneeAngle) * (this.LEG_LENGTH / 2)
            this.kneePos.y = this.hipPos.y + Math.sin(kneeAngle) * (this.LEG_LENGTH / 2)
        }
    }

    curlUp(hip: Vector2, velocity: Vector2) {
        this.hipPos = hip
        const hipOffset = (this.LEG_LENGTH / 2)

        this.updateDirection(velocity)

        this.stepTarget.x = this.hipPos.x
        this.stepTarget.y = this.hipPos.y + hipOffset
        this.footPos.x += (this.stepTarget.x - this.footPos.x) * (this.LERP_SPEED / 2)
        this.footPos.y = (this.footPos.y > this.hipPos.y + hipOffset) ? this.footPos.y + (this.stepTarget.y - this.footPos.y) * this.LERP_SPEED : this.hipPos.y + hipOffset

        this.isStepping = false
        this.stepProgress = 1.0

        this.invertTheKinematics()

        this.leg.clear().moveTo(this.hipPos.x, this.hipPos.y - PLAYER_VISUAL_CONFIG.HIP_TUCK).lineTo(this.kneePos.x, this.kneePos.y).lineTo(this.footPos.x, this.footPos.y).stroke({
            color: "#000000",
            width: PLAYER_VISUAL_CONFIG.LEG_STROKE_WIDTH,
            cap: "round"
        })
    }
}