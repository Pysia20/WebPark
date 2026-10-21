import { Sprite } from "pixi.js";
import { ServerEntityData } from "@shared/commonModels";
import { Ent } from "./Ent";

export class JohnEnt extends Ent {
    sprite: Sprite
    data: ServerEntityData

    constructor(data: ServerEntityData, sprite: Sprite) {
        super(sprite)

        this.data = data
        this.sprite = sprite
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