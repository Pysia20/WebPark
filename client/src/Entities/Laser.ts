import { Container, Graphics } from "pixi.js";
import { Ent } from "./Ent";
import { ServerEntityData } from "@shared/commonModels";
import { ENTITY_VISUAL_CONFIG } from "@shared/commonVariables";

export class LaserEnt extends Ent {
    wave: Graphics
    base: Graphics
    glow: Graphics

    offset: number = 0
    length: number
    halfJitter: number
    step: number

    data: ServerEntityData

    constructor(data: ServerEntityData) {
        const wave = new Graphics()
        super(wave)
        this.base = new Graphics()
        this.glow = new Graphics()

        this.data = data
        this.wave = wave
        this.length = data.visualSize.y - (ENTITY_VISUAL_CONFIG.LASER.BASE_WIDTH / 2)
        this.step = this.length / ENTITY_VISUAL_CONFIG.LASER.STEP
        this.halfJitter = ENTITY_VISUAL_CONFIG.LASER.JITTER / 2

        this.wave.position.set(data.pos.x + (data.visualSize.x / 2), data.pos.y + (ENTITY_VISUAL_CONFIG.LASER.BASE_WIDTH / 2))
        this.glow.position.set(data.pos.x + (data.visualSize.x / 2), data.pos.y + (ENTITY_VISUAL_CONFIG.LASER.BASE_WIDTH / 2))
        this.base.position.set(data.pos.x, data.pos.y)

        this.drawBase()
    }

    update(data: ServerEntityData, deltaT: number) {
        this.offset += ENTITY_VISUAL_CONFIG.LASER.OFFSET * deltaT

        this.wave.clear()
        this.glow.clear()

        for (let i = 0; i <= this.length; i += this.step) {
            const rand  = (Math.random() * ENTITY_VISUAL_CONFIG.LASER.JITTER) - this.halfJitter

            const waveX = Math.sin((i * ENTITY_VISUAL_CONFIG.LASER.FREQUENCY) + this.offset) * (ENTITY_VISUAL_CONFIG.LASER.AMPLITUDE + rand)

            //i == waveY btw
            if (i === 0) {
                this.wave.moveTo(waveX, i)
                this.glow.moveTo(waveX, i)
            } else {
                this.wave.lineTo(waveX, i)
                this.glow.lineTo(waveX, i)
            }
        }

        this.wave.stroke({color: ENTITY_VISUAL_CONFIG.LASER.COLOR, width: ENTITY_VISUAL_CONFIG.LASER.WIDTH, cap: "butt", join: "round", alpha: ENTITY_VISUAL_CONFIG.LASER.OPACITY})
        this.glow.stroke({color: ENTITY_VISUAL_CONFIG.LASER.GLOW_COLOR, width: ENTITY_VISUAL_CONFIG.LASER.GLOW_WIDTH, cap: "butt", join: "round", alpha: ENTITY_VISUAL_CONFIG.LASER.GLOW_OPACITY})
    }

    //this seems very meh
    drawBase() {
        this.base.moveTo(0, 0)
        this.base.lineTo(this.data.visualSize.x, 0)
        this.base.stroke({color: ENTITY_VISUAL_CONFIG.LASER.BASE_COLOR, width: ENTITY_VISUAL_CONFIG.LASER.BASE_WIDTH, cap: "round"})

        this.base.moveTo(0, this.data.visualSize.y)
        this.base.lineTo(this.data.visualSize.x, this.data.visualSize.y)
        this.base.stroke({color: ENTITY_VISUAL_CONFIG.LASER.BASE_COLOR, width: ENTITY_VISUAL_CONFIG.LASER.BASE_WIDTH, cap: "round"})
    }

    override beGone(world: Container) {
        super.beGone(world);

        world.removeChild(this.glow)
        world.removeChild(this.base)
    }

    override spawnIn(world: Container) {
        world.addChild(this.glow)
        super.spawnIn(world)
        world.addChild(this.base)
    }
}