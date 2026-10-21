import { Graphics } from "pixi.js";
import { Ent } from "./Ent";
import { ServerEntityData } from "@shared/commonModels";

export class Laser extends Ent {
    wave: Graphics
    offset: number = 0
    length: number
    data: ServerEntityData

    constructor(data: ServerEntityData) {
        const wave = new Graphics()
        super(wave)

        this.data = data
        this.wave = wave
        this.length = length

        this.wave.position.set(0, 0)
    }

    update(data: ServerEntityData, deltaT: number) {
        this.offset += 0.2 * deltaT

        this.wave.clear()

        for (let i = 0; i <= this.length; i += 5) {
            const test = Math.sin(this.offset)

            if (i === 0) {
                this.wave.moveTo(test, i)
            } else {
                this.wave.lineTo(test, i)
            }
        }

        this.wave.stroke({color: "#ff0000", width: 5})
    }
}