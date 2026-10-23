import { Graphics } from "pixi.js";
import { Ent } from "./Ent";
import { ServerEntityData } from "@shared/commonModels";
import { ENTITY_VISUAL_CONFIG } from "@shared/commonVariables";

export class LaserEnt extends Ent {
    wave: Graphics
    offset: number = 0
    length: number
    data: ServerEntityData

    constructor(data: ServerEntityData) {
        const wave = new Graphics()
        super(wave)

        this.data = data
        this.wave = wave
        this.length = data.visualSize.y

        this.wave.position.set(data.pos.x + (data.visualSize.x / 2), data.pos.y)
    }

    update(data: ServerEntityData, deltaT: number) {
        //Kind of useless rn? unless we decide to move the laser
    //    this.wave.position.set(data.pos.x + (data.visualSize.x / 2), data.pos.y)
    //    this.length = data.visualSize.y

        this.offset += ENTITY_VISUAL_CONFIG.LASER.OFFSET * deltaT

        this.wave.clear()

        const step = this.length / 28
        const halfJitter = ENTITY_VISUAL_CONFIG.LASER.JITTER / 2
        for (let i = 0; i <= this.length; i += step) {
            const rand  = (Math.random() * ENTITY_VISUAL_CONFIG.LASER.JITTER) - halfJitter

            const waveX = Math.sin((i * ENTITY_VISUAL_CONFIG.LASER.FREQUENCY) + this.offset) * (ENTITY_VISUAL_CONFIG.LASER.AMPLITUDE + rand)

            //i == waveY btw
            if (i === 0) {
                this.wave.moveTo(waveX, i)
            } else {
                this.wave.lineTo(waveX, i)
            }
        }

        this.wave.stroke({color: ENTITY_VISUAL_CONFIG.LASER.COLOR, width: ENTITY_VISUAL_CONFIG.LASER.WIDTH, cap: "round", join: "round"})

        this.drawBase()
    }

    //this seems very meh
    drawBase() {
        const halfWidth = (this.data.visualSize.x / 2) + (ENTITY_VISUAL_CONFIG.LASER.JITTER / 2)

        this.wave.moveTo(-halfWidth, 0)
        this.wave.lineTo(halfWidth, 0)
        this.wave.stroke({color: "#000000", width: ENTITY_VISUAL_CONFIG.LASER.WIDTH, cap: "round"})

        this.wave.moveTo(-halfWidth, this.data.visualSize.y)
        this.wave.lineTo(halfWidth, this.data.visualSize.y)
        this.wave.stroke({color: "#000000", width: ENTITY_VISUAL_CONFIG.LASER.WIDTH, cap: "round"})
    }
}