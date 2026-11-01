import { Sprite } from "pixi.js";
import { Ent } from "./Ent";
import { ServerButtonDoorData } from "@shared/commonEntityData";
import {ENTITY_VISUAL_CONFIG} from "@shared/commonVariables";
import {lerpIt} from "../FavoriteChild";

export class BoorEnt extends Ent {
    sprite: Sprite
    data: ServerButtonDoorData
    opacity: number = 1
    currentHeight: number

    constructor(data: ServerButtonDoorData, sprite: Sprite) {
        super(sprite)

        this.data = data
        this.sprite = sprite
        this.currentHeight =  this.data.visualSize.y

        this.sprite.position.set(data.pos.x, data.pos.y)
        this.sprite.setSize(data.visualSize.x, data.visualSize.y)
    }

    update(data: ServerButtonDoorData, deltaT: number) {
        if (data.isOpen && this.opacity > ENTITY_VISUAL_CONFIG.BOOR.MIN_OPACITY) {
            this.opacity = lerpIt(this.opacity, 0.5, ENTITY_VISUAL_CONFIG.BOOR.LARP)
            this.currentHeight = lerpIt(this.currentHeight, (data.visualSize.y * ENTITY_VISUAL_CONFIG.BOOR.CLOSE_RATIO), ENTITY_VISUAL_CONFIG.BOOR.LARP)
        } else if (!data.isOpen) {
            this.opacity = lerpIt(this.opacity, 1, ENTITY_VISUAL_CONFIG.BOOR.LARP)
            this.currentHeight = lerpIt(this.currentHeight, data.visualSize.y, ENTITY_VISUAL_CONFIG.BOOR.LARP)
        } else {
            this.opacity = ENTITY_VISUAL_CONFIG.BOOR.MIN_OPACITY
            this.currentHeight = data.visualSize.y * ENTITY_VISUAL_CONFIG.BOOR.CLOSE_RATIO
        }

        this.sprite.alpha = this.opacity
        this.sprite.height = this.currentHeight
    }
}