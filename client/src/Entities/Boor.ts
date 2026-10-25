import {Graphics, Sprite} from "pixi.js";
import { Ent } from "./Ent";
import { ServerButtonDoorData } from "@shared/commonEntityData";

export class BoorEnt extends Ent {
    door: Graphics
    data: ServerButtonDoorData

    constructor(data: ServerButtonDoorData) {
        const door = new Graphics()
        super(door)
        this.door = door
        this.data = data

        this.door.position.set(data.pos.x, data.pos.y)
        this.door.setSize(data.visualSize.x, data.visualSize.y)

        this.door.rect(0, 0, data.visualSize.x, data.visualSize.y)``

        /*
        graphics
    .rect(0, 0, 100, 100)
    .fill({ color: 0xff0000 }) // Fill with red
    .stroke({ width: 2, color: 0x000000 }); // Stroke with black
         */
    }

    update(data: ServerButtonDoorData, deltaT: number) {
        this.door.alpha = data.isOpen ? 0.1 : 1
    }
}