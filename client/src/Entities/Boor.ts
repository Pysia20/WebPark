import { Sprite } from "pixi.js";
import { Ent } from "./Ent";
import { ServerButtonDoorData } from "@shared/commonEntityData";

export class BoorEnt extends Ent {
    sprite: Sprite
    data: ServerButtonDoorData
    opacity: number = 1
    currentWidth: number

    constructor(data: ServerButtonDoorData, sprite: Sprite) {
        super(sprite)

        this.data = data
        this.sprite = sprite
        this.currentWidth =  this.data.visualSize.x

        this.sprite.position.set(data.pos.x, data.pos.y)
        this.sprite.setSize(data.visualSize.x, data.visualSize.y)
    }

    update(data: ServerButtonDoorData, deltaT: number) {
        if (data.isOpen && this.opacity > 0.05) {
            this.opacity += (0 - this.opacity) * 0.3
            this.currentWidth += ((data.visualSize.x / 6) - this.currentWidth) * 0.3
        } else if (!data.isOpen) {
            this.opacity += (1 - this.opacity) * 0.3
            this.currentWidth += (data.visualSize.x - this.currentWidth) * 0.3
        } else {
            this.opacity = 0.05
            this.currentWidth = data.visualSize.x / 6
        }

        this.sprite.alpha = this.opacity
        this.sprite.width = this.currentWidth
    }
}