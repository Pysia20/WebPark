import { Container, Graphics } from "pixi.js";
import { Ent } from "./Ent";
import {ServerEntityData, Vector2} from "@shared/commonModels";
import { ENTITY_VISUAL_CONFIG } from "@shared/commonVariables";

export class LaserEnt extends Ent {
    wave: Graphics
    baseUp: Graphics
    baseDown: Graphics
    glow: Graphics

    offset: number = 0
    length: number
    halfJitter: number
    step: number

    data: ServerEntityData

    constructor(data: ServerEntityData) {
        const wave = new Graphics()
        super(wave)
        this.baseUp = new Graphics()
        this.baseDown = new Graphics()
        this.glow = new Graphics()

        this.data = data
        this.wave = wave
        this.length = data.visualSize.y - (ENTITY_VISUAL_CONFIG.LASER.WIDTH / 2)
        this.step = this.length / ENTITY_VISUAL_CONFIG.LASER.STEP
        this.halfJitter = ENTITY_VISUAL_CONFIG.LASER.JITTER / 2

        this.wave.position.set(data.pos.x + (data.visualSize.x / 2), data.pos.y + (ENTITY_VISUAL_CONFIG.LASER.WIDTH / 2))
        this.glow.position.set(data.pos.x + (data.visualSize.x / 2), data.pos.y + (ENTITY_VISUAL_CONFIG.LASER.WIDTH / 2))
        this.baseUp.position.set(data.pos.x, data.pos.y)
        this.baseDown.position.set(data.pos.x, data.pos.y)

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

        this.wave.stroke({color: ENTITY_VISUAL_CONFIG.LASER.COLOR, width: ENTITY_VISUAL_CONFIG.LASER.WIDTH, cap: "round", join: "round", alpha: ENTITY_VISUAL_CONFIG.LASER.OPACITY})
        this.glow.stroke({color: ENTITY_VISUAL_CONFIG.LASER.GLOW_COLOR, width: ENTITY_VISUAL_CONFIG.LASER.GLOW_WIDTH, cap: "round", join: "round", alpha: ENTITY_VISUAL_CONFIG.LASER.GLOW_OPACITY})
    }

    //this seems very meh
    drawBase() {
        let start: Vector2 = {x: -ENTITY_VISUAL_CONFIG.LASER.BASE_START_OFFSET, y: 0}
        let wall: Vector2 = {x: 0, y: -ENTITY_VISUAL_CONFIG.LASER.BASE_WALL_OFFSET}
        let spike: Vector2 = {x: this.data.visualSize.x / 2, y: -ENTITY_VISUAL_CONFIG.LASER.BASE_SPIKE_OFFSET}
        let wall2: Vector2 = {x: this.data.visualSize.x, y: -ENTITY_VISUAL_CONFIG.LASER.BASE_WALL_OFFSET}
        let end: Vector2 = {x: this.data.visualSize.x + ENTITY_VISUAL_CONFIG.LASER.BASE_START_OFFSET, y: 0}

        this.baseUp.poly([start.x, start.y, wall.x , wall.y, spike.x, spike.y, wall2.x, wall2.y, end.x, end.y]).fill({color: ENTITY_VISUAL_CONFIG.LASER.BASE_COLOR})

        start.y  = this.data.visualSize.y
        wall.y = this.data.visualSize.y + ENTITY_VISUAL_CONFIG.LASER.BASE_WALL_OFFSET
        spike.y  = this.data.visualSize.y + ENTITY_VISUAL_CONFIG.LASER.BASE_SPIKE_OFFSET
        wall2.y  = this.data.visualSize.y + ENTITY_VISUAL_CONFIG.LASER.BASE_WALL_OFFSET
        end.y = this.data.visualSize.y

        this.baseDown.poly([start.x, start.y, wall.x , wall.y, spike.x, spike.y, wall2.x, wall2.y, end.x, end.y]).fill({color: ENTITY_VISUAL_CONFIG.LASER.BASE_COLOR})

        /*
        this.base.moveTo(0, 0)
        this.base.lineTo(this.data.visualSize.x, 0)
        this.base.stroke({color: ENTITY_VISUAL_CONFIG.LASER.BASE_COLOR, width: ENTITY_VISUAL_CONFIG.LASER.BASE_WIDTH, cap: "round"})

        this.base.moveTo(0, this.data.visualSize.y)
        this.base.lineTo(this.data.visualSize.x, this.data.visualSize.y)
        this.base.stroke({color: ENTITY_VISUAL_CONFIG.LASER.BASE_COLOR, width: ENTITY_VISUAL_CONFIG.LASER.BASE_WIDTH, cap: "round"})
         */
    }

    override beGone(world: Container) {
        super.beGone(world);

        world.removeChild(this.glow)
        world.removeChild(this.baseUp)
        world.removeChild(this.baseDown)
    }

    override spawnIn(world: Container) {
        world.addChild(this.glow)
        super.spawnIn(world)
        world.addChild(this.baseUp)
        world.addChild(this.baseDown)
    }
}