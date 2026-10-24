import { Sprite } from "pixi.js";
import { Ent } from "./Ent";
import {ServerButtonDoorData} from "@shared/commonEntityData";

export class BoorEnt extends Ent {
    sprite: Sprite
    data: ServerButtonDoorData

    constructor(data: ServerButtonDoorData, sprite: Sprite) {
        super(sprite)

        this.data = data
        this.sprite = sprite
    }

    update(data: ServerButtonDoorData, deltaT: number) {
        this.sprite.position.set(data.pos.x, data.pos.y)
        this.sprite.setSize(data.visualSize.x, data.visualSize.y)
        this.sprite.alpha = data.isOpen ? 0.1 : 1
    }
}