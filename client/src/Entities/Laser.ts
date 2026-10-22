import { Graphics } from "pixi.js";
import { Ent } from "./Ent";
import { ServerEntityData } from "@shared/commonModels";

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
        this.length = length

        this.wave.position.set(0, 0)
    }

    update(data: ServerEntityData, deltaT: number) {
        this.wave.position.set(data.pos.x + (data.visualSize.x / 2), data.pos.y)
        this.length = data.visualSize.y

        this.offset += 0.2 * deltaT

        this.wave.clear()

        for (let i = 0; i <= this.length; i += 4) {
            const test = Math.sin(this.offset + i * 200) * 20

            if (i === 0) {
                this.wave.moveTo(test, i)
            } else {
                this.wave.lineTo(test, i)
            }
        }

        this.wave.stroke({color: "#ff0000", width: 5, cap: "round", join: "miter"})
    }
}

/*
export class JohnEnt extends Ent {
    sprite: Sprite
    data: ServerEntityData

    constructor(data: ServerEntityData, sprite: Sprite) {
        super(sprite)

        this.data = data
        this.sprite = sprite
    }

    update(data: ServerEntityData, deltaT: number) {
        this.sprite.position.set(data.pos.x, data.pos.y)
        this.sprite.setSize(data.visualSize.x, data.visualSize.y)
    }
}
 */