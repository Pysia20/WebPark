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
        this.sprite.position.set(data.pos.x, data.pos.y)
        this.sprite.setSize(data.visualSize.x, data.visualSize.y)
    }
}