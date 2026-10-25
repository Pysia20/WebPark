import { Sprite } from "pixi.js";
import { Ent } from "./Ent";
import { ServerButtonDoorData } from "@shared/commonEntityData";
import {ENTITY_VISUAL_CONFIG} from "@shared/commonVariables";

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
        if (data.isOpen && this.opacity > ENTITY_VISUAL_CONFIG.BOOR.MIN_OPACITY) {
            this.opacity += (0 - this.opacity) * ENTITY_VISUAL_CONFIG.BOOR.LARP
            this.currentWidth += ((data.visualSize.x * ENTITY_VISUAL_CONFIG.BOOR.CLOSE_RATIO) - this.currentWidth) * ENTITY_VISUAL_CONFIG.BOOR.LARP
        } else if (!data.isOpen) {
            this.opacity += (1 - this.opacity) * ENTITY_VISUAL_CONFIG.BOOR.LARP
            this.currentWidth += (data.visualSize.x - this.currentWidth) * ENTITY_VISUAL_CONFIG.BOOR.LARP
        } else {
            this.opacity = ENTITY_VISUAL_CONFIG.BOOR.MIN_OPACITY
            this.currentWidth = data.visualSize.x * ENTITY_VISUAL_CONFIG.BOOR.CLOSE_RATIO
        }

        this.sprite.alpha = this.opacity
        this.sprite.width = this.currentWidth
    }
}