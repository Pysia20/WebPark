import { NineSliceSprite, Texture } from "pixi.js";
import { Ent } from "./Ent";
import { lerpTheyThem } from "../FavoriteChild";
import { ServerEntityData } from "@shared/commonModels";
import {ENTITY_VISUAL_CONFIG} from "@shared/commonVariables";
export class PlatformEnt extends Ent {
    sprite: NineSliceSprite
    data: ServerEntityData

    LERP_SPEED = ENTITY_VISUAL_CONFIG.PLATFORM.LARP

    constructor(data: ServerEntityData, texture: Texture) {
        const sprite = new NineSliceSprite({
            texture: texture,
            leftWidth: ENTITY_VISUAL_CONFIG.PLATFORM.SLICE_WIDTH,
            rightWidth: ENTITY_VISUAL_CONFIG.PLATFORM.SLICE_WIDTH,
            topHeight: ENTITY_VISUAL_CONFIG.PLATFORM.SLICE_HEIGHT,
            bottomHeight: ENTITY_VISUAL_CONFIG.PLATFORM.SLICE_HEIGHT,
            width: data.visualSize.x,
            height: data.visualSize.y
        })
        super(sprite)

        this.data = data
        this.sprite = sprite

        this.sprite.position.set(data.pos.x, data.pos.y)
        this.sprite.setSize(data.visualSize.x, data.visualSize.y)
    }

    update(data: ServerEntityData, deltaT: number) {
        this.data = data

        lerpTheyThem(this.sprite.position, data.pos, this.LERP_SPEED)
    }
}