import {Container, Graphics, Sprite} from "pixi.js";
import { Ent } from "./Ent";
import { ENTITY_VISUAL_CONFIG } from "@shared/commonVariables";
import { ServerLaserEntityData } from "@shared/commonEntityData";
import {pulseer} from "../Shaders";

export class LaserEnt extends Ent {
    wave: Graphics
    baseUp: Sprite
    baseDown: Sprite
    glow: Graphics

    offset: number = 0
    length: number
    halfJitter: number
    step: number
    currentAmplitude: number = ENTITY_VISUAL_CONFIG.LASER.AMPLITUDE
    alphaOffset: number = 0
    randOffset: number = 1

    test: boolean = true

    data: ServerLaserEntityData

    constructor(data: ServerLaserEntityData, baseUp: Sprite, baseDown: Sprite) {
        const wave = new Graphics()
        super(wave)
        this.baseUp = baseUp
        this.baseDown = baseDown
        this.glow = new Graphics()

        this.data = data
        this.wave = wave
        this.length = data.visualSize.y - (ENTITY_VISUAL_CONFIG.LASER.WIDTH / 2)
        this.step = this.length / ENTITY_VISUAL_CONFIG.LASER.STEP
        this.halfJitter = ENTITY_VISUAL_CONFIG.LASER.JITTER / 2

        this.wave.position.set(data.pos.x + (data.visualSize.x / 2), data.pos.y + (ENTITY_VISUAL_CONFIG.LASER.WIDTH / 2))
        this.glow.position.set(data.pos.x + (data.visualSize.x / 2), data.pos.y + (ENTITY_VISUAL_CONFIG.LASER.WIDTH / 2))
        this.baseUp.position.set(data.pos.x, data.pos.y)
        this.baseDown.position.set(data.pos.x, data.pos.y + data.visualSize.y - this.baseDown.height)

     //   this.glow.filters = [pulseer] TODO: WHY BROKEN
    }

    update(data: ServerLaserEntityData, deltaT: number) {
        this.offset += ENTITY_VISUAL_CONFIG.LASER.OFFSET * deltaT

        this.wave.clear()
        this.glow.clear()

        this.damp(data.isActive)

        for (let i = 0; i <= this.length; i += this.step) {
            const rand  = (Math.random() * ENTITY_VISUAL_CONFIG.LASER.JITTER) - this.halfJitter

            const waveX = Math.sin((i * ENTITY_VISUAL_CONFIG.LASER.FREQUENCY) + this.offset) * (this.currentAmplitude + (rand / this.randOffset))

            //i == waveY btw
            if (i === 0) {
                this.wave.moveTo(waveX, i)
                this.glow.moveTo(waveX, i)
            } else {
                this.wave.lineTo(waveX, i)
                this.glow.lineTo(waveX, i)
            }
        }

        const waveAlpha = Math.max(0, ENTITY_VISUAL_CONFIG.LASER.OPACITY - this.alphaOffset)
        const glowAlpha = Math.max(0, ENTITY_VISUAL_CONFIG.LASER.GLOW_OPACITY - this.alphaOffset)

        this.wave.stroke({color: ENTITY_VISUAL_CONFIG.LASER.COLOR, width: ENTITY_VISUAL_CONFIG.LASER.WIDTH, cap: "round", join: "round", alpha: waveAlpha})
        this.glow.stroke({color: ENTITY_VISUAL_CONFIG.LASER.GLOW_COLOR, width: ENTITY_VISUAL_CONFIG.LASER.GLOW_WIDTH, cap: "round", join: "round", alpha: glowAlpha})
    }

    damp(isActive: boolean) {
        if (!isActive && this.currentAmplitude > 0) {
            this.currentAmplitude += (0 - this.currentAmplitude) * ENTITY_VISUAL_CONFIG.LASER.AMPLITUDE_DAMP_SPEED
            this.alphaOffset += (1 - this.alphaOffset) * ENTITY_VISUAL_CONFIG.LASER.OPACITY_DAMP_SPEED
            this.randOffset += (ENTITY_VISUAL_CONFIG.LASER.JITTER - this.randOffset) * ENTITY_VISUAL_CONFIG.LASER.JITTER_DAMP_SPEED
        } else if (this.currentAmplitude < ENTITY_VISUAL_CONFIG.LASER.AMPLITUDE) {
            this.currentAmplitude += (ENTITY_VISUAL_CONFIG.LASER.AMPLITUDE - this.currentAmplitude) * ENTITY_VISUAL_CONFIG.LASER.AMPLITUDE_UNDAMP_SPEED
            this.alphaOffset += (0 - this.alphaOffset) * ENTITY_VISUAL_CONFIG.LASER.OPACITY_UNDAMP_SPEED
            this.randOffset += (1 - this.randOffset) * ENTITY_VISUAL_CONFIG.LASER.JITTER_UNDAMP_SPEED
        } else {
            this.currentAmplitude = ENTITY_VISUAL_CONFIG.LASER.AMPLITUDE
            this.alphaOffset = 0
            this.randOffset = 1
        }
    }

    override beGone(world: Container) {
        super.beGone(world);

        world.removeChild(this.glow)
        world.removeChild(this.baseUp)
        world.removeChild(this.baseDown)
    }

    override spawnIn(world: Container) {
        world.addChild(this.glow)
        world.addChild(this.baseUp)
        world.addChild(this.baseDown)

        super.spawnIn(world)
    }
}