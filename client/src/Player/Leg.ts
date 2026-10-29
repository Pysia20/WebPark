import {Vector2} from "@shared/commonModels";
import {Graphics} from "pixi.js";
import {PLAYER_CONFIG, PLAYER_VISUAL_CONFIG} from "@shared/commonVariables";
import {Directions} from "./PlayerEnums";
import {lerpIt, lerpTheyThem} from "../FavoriteChild";

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

    LERP_SPEED: number = PLAYER_VISUAL_CONFIG.LEG.LERP
    LEG_LENGTH: number = PLAYER_CONFIG.HEIGHT * PLAYER_VISUAL_CONFIG.LEG.LENGTH_RATIO
    DRAG: number = PLAYER_VISUAL_CONFIG.LEG.DRAG

    constructor() {
        this.leg.position.set(0, 0)
    }

    updateLeg(hip: Vector2, otherLeg: Leg, velocity: Vector2, ground: number, direction: Directions, deltaTime: number) {
        const distance = Math.abs(hip.x - this.footPos.x)
        this.hipPos = hip
        this.direction = direction

        if (this.prevGround != ground) {
            this.footPos.y = ground
            this.prevGround = ground
        }

        if (!this.isStepping && !otherLeg.isStepping && distance > PLAYER_VISUAL_CONFIG.LEG.MAX_STRETCH) {
            this.isStepping = true
            this.stepProgress = 0
            this.stepStart = {x: this.footPos.x, y: this.footPos.y}
            const fowardOffset = (velocity.x > 0) ? PLAYER_VISUAL_CONFIG.LEG.STEP : -PLAYER_VISUAL_CONFIG.LEG.STEP
            this.stepTarget = {x: hip.x + fowardOffset, y: ground}
        }

        if (this.isStepping) {
            this.stepProgress += PLAYER_VISUAL_CONFIG.LEG.STEP_SPEED * deltaTime

            if (this.direction == Directions.Left) {
                if (this.stepTarget.x > this.hipPos.x - (PLAYER_CONFIG.WIDTH * PLAYER_VISUAL_CONFIG.LEG.STEP_MIN_OFFSET_RATIO)) this.stepTarget.x -= (PLAYER_CONFIG.WIDTH * PLAYER_VISUAL_CONFIG.LEG.STEP_NUDGE_RATIO)
            } else if (this.direction == Directions.Right) {
                if (this.stepTarget.x < this.hipPos.x + (PLAYER_CONFIG.WIDTH * PLAYER_VISUAL_CONFIG.LEG.STEP_MIN_OFFSET_RATIO)) this.stepTarget.x += (PLAYER_CONFIG.WIDTH * PLAYER_VISUAL_CONFIG.LEG.STEP_NUDGE_RATIO)
            }
            if (this.stepProgress >= 1.0) {
                this.stepProgress = 1.0
                this.isStepping = false
                this.footPos = {x: this.stepTarget.x, y: this.stepTarget.y}
            } else {
                this.footPos.x = this.stepStart.x + (this.stepTarget.x - this.stepStart.x) * this.stepProgress
                const liftArc = Math.sin(this.stepProgress * Math.PI) * (PLAYER_CONFIG.HEIGHT * PLAYER_VISUAL_CONFIG.LEG.LIFT_RATIO)
                this.footPos.y = ground - liftArc
            }
        }

        this.invertTheKinematics()

        this.leg.clear().moveTo(this.hipPos.x, this.hipPos.y - PLAYER_VISUAL_CONFIG.LEG.HIP_TUCK).lineTo(this.kneePos.x, this.kneePos.y).lineTo(this.footPos.x, this.footPos.y).stroke({
            color: "#000000",
            width: PLAYER_VISUAL_CONFIG.LEG.STROKE_WIDTH,
            cap: "round",
            join: "miter"
        });
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

    curlUp(hip: Vector2, velocity: Vector2, direction: Directions) {
        this.hipPos = hip
        this.direction = direction
        const hipOffset = (this.LEG_LENGTH / 2)
        const dragOffset = velocity.x * this.DRAG

        this.stepTarget.x = this.hipPos.x - dragOffset
        this.stepTarget.y = this.hipPos.y + hipOffset

        if (this.footPos.y > this.hipPos.y + hipOffset) {
            lerpTheyThem(this.footPos, this.stepTarget, this.LERP_SPEED)
        } else {
            this.footPos.x = lerpIt(this.footPos.x, this.stepTarget.x, (this.LERP_SPEED / 2))
            this.footPos.y = this.hipPos.y + hipOffset
        }

        this.isStepping = false
        this.stepProgress = 1.0

        this.invertTheKinematics()

        this.leg.clear().moveTo(this.hipPos.x, this.hipPos.y - PLAYER_VISUAL_CONFIG.LEG.HIP_TUCK).lineTo(this.kneePos.x, this.kneePos.y).lineTo(this.footPos.x, this.footPos.y).stroke({
            color: "#000000",
            width: PLAYER_VISUAL_CONFIG.LEG.STROKE_WIDTH,
            cap: "round"
        })
    }
}