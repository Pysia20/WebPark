import { Sprite } from "pixi.js";
import {ServerEntityData, Vector2} from "@shared/commonModels";
import { Ent } from "./Ent";
import {ENTITY_VISUAL_CONFIG} from "@shared/commonVariables";

export class JohnEnt extends Ent {
    sprite: Sprite
    data: ServerEntityData

    constructor(data: ServerEntityData, sprite: Sprite) {
        super(sprite)

        this.data = data
        this.sprite = sprite

        this.sprite.position.set(data.pos.x, data.pos.y)
        this.sprite.setSize(data.visualSize.x, data.visualSize.y)
    }

    update(data: ServerEntityData, deltaT: number) {
        const lerp = ENTITY_VISUAL_CONFIG.JOHN.LERP

        this.sprite.position.x += (data.pos.x - this.sprite.position.x) * lerp
        this.sprite.position.y += (data.pos.y - this.sprite.position.y) * lerp

        this.sprite.width += (data.visualSize.x - this.sprite.width) * lerp
        this.sprite.height += (data.visualSize.y - this.sprite.height) * lerp

        this.data = data
    }
}

// this.footPos.x += (this.stepTarget.x - this.footPos.x) * (this.LERP_SPEED / 2)