import { Sprite } from "pixi.js";
import { ServerEntityData } from "@shared/commonModels";
import { Ent } from "./Ent";
import { ENTITY_VISUAL_CONFIG } from "@shared/commonVariables";

export class JohnEnt extends Ent {
    sprite: Sprite
    data: ServerEntityData

    LERP_SPEED = ENTITY_VISUAL_CONFIG.JOHN.LERP

    constructor(data: ServerEntityData, sprite: Sprite) {
        super(sprite)

        this.data = data
        this.sprite = sprite

        this.sprite.position.set(data.pos.x, data.pos.y)
        this.sprite.setSize(data.visualSize.x, data.visualSize.y)
    }

    update(data: ServerEntityData, deltaT: number) {
        this.sprite.position.x += (data.pos.x - this.sprite.position.x) * this.LERP_SPEED
        this.sprite.position.y += (data.pos.y - this.sprite.position.y) * this.LERP_SPEED

        this.sprite.width += (data.visualSize.x - this.sprite.width) * this.LERP_SPEED
        this.sprite.height += (data.visualSize.y - this.sprite.height) * this.LERP_SPEED
    }
}