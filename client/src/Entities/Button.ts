import { Sprite } from "pixi.js";
import { Ent } from "./Ent";
import { ServerButtonData } from "@shared/commonEntityData";

export class ButtonEnt extends Ent {
    sprite: Sprite
    data: ServerButtonData

    constructor(data: ServerButtonData, sprite: Sprite) {
        super(sprite)

        this.data = data
        this.sprite = sprite
    }

    update(data: ServerButtonData, deltaT: number) {
        this.sprite.position.set(data.pos.x, data.pos.y)
        this.sprite.setSize(data.visualSize.x, data.visualSize.y)
        this.sprite.alpha = data.isPressed ? 0.5 : 1
    }
}