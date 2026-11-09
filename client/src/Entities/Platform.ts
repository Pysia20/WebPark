import { NineSliceSprite, Texture } from "pixi.js";
import { Ent } from "./Ent";
import { lerpTheyThem } from "../FavoriteChild";
import { ServerEntityData } from "@shared/commonModels";
//TODO: CLEANUP
export class PlatformEnt extends Ent {
    sprite: NineSliceSprite
    data: ServerEntityData

    constructor(data: ServerEntityData, texture: Texture) {
        const sprite = new NineSliceSprite({
            texture: texture,
            leftWidth: 24,
            rightWidth: 24,
            topHeight: 5,
            bottomHeight: 5,
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

        lerpTheyThem(this.sprite.position, data.pos, 0.3)
    }
}