import {Container, Graphics, Sprite} from "pixi.js";
import { Ent } from "./Ent";
import { ServerButtonDoorData } from "@shared/commonEntityData";
import {ENTITY_VISUAL_CONFIG} from "@shared/commonVariables";
import {lerpIt} from "../FavoriteChild";

export class BoorEnt extends Ent {
    sprite: Sprite
    mask: Graphics
    data: ServerButtonDoorData

    currentOffset: number

    constructor(data: ServerButtonDoorData, sprite: Sprite) {
        super(sprite)

        this.data = data
        this.sprite = sprite
        this.currentOffset =  this.data.visualSize.y

        this.sprite.position.set(data.pos.x, data.pos.y)
        this.sprite.setSize(data.visualSize.x, data.visualSize.y)

        this.mask = new Graphics().rect(this.data.pos.x, this.data.pos.y, this.sprite.width, this.sprite.height).fill("#ffffff")
        this.sprite.mask = this.mask
    }

    update(data: ServerButtonDoorData, deltaT: number) {
        if (data.isOpen) {
            this.currentOffset = lerpIt(this.currentOffset, (data.visualSize.y * ENTITY_VISUAL_CONFIG.BOOR.CLOSE_RATIO), ENTITY_VISUAL_CONFIG.BOOR.LARP)
        } else if (!data.isOpen) {
            this.currentOffset = lerpIt(this.currentOffset, 0, ENTITY_VISUAL_CONFIG.BOOR.LARP)
        }

        this.sprite.position.y = data.pos.y - this.currentOffset
    }

    override spawnIn(world: Container) {
        super.spawnIn(world);

        world.addChild(this.mask)
    }

    override beGone(world: Container) {
        super.beGone(world);

        world.removeChild(this.mask)
    }
}