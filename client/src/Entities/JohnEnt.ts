import { Sprite } from "pixi.js";
import { ServerEntityData } from "@shared/commonModels";
import { Ent } from "./Ent";
import { ENTITY_VISUAL_CONFIG } from "@shared/commonVariables";
import {lerpIt, lerpTheyThem} from "../FavoriteChild";

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
        lerpTheyThem(this.sprite.position, data.pos, this.LERP_SPEED)

        this.sprite.width = lerpIt(this.sprite.width, data.visualSize.x, this.LERP_SPEED)
        this.sprite.height = lerpIt(this.sprite.height, data.visualSize.y, this.LERP_SPEED)
    }
}