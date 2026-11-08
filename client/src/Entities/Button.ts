import {Color, Container, Graphics, Sprite} from "pixi.js";
import { Ent } from "./Ent";
import { ServerButtonData } from "@shared/commonEntityData";
import {lerpIt} from "../FavoriteChild";
//TODO: MAGIC VALS RAAAAAAA
export class ButtonEnt extends Ent {
    button: Sprite
    base: Sprite
    mask: Graphics
    data: ServerButtonData

    clickOffset = 0
    color = new Color({r: 215, g: 108, b: 108})

    LERP_SPEED = 0.3

    constructor(data: ServerButtonData, button: Sprite, base: Sprite, gridSize: number) {
        super(button)

        this.data = data
        const offset = gridSize - this.data.visualSize.y
        this.data.pos.y -= offset

        this.button = button
        this.base = base
        this.mask = new Graphics().rect(this.data.pos.x, this.data.pos.y, gridSize, gridSize).fill("#ffffff")

        //TODO: CONVERT FROM HEX WHEN SETTING AND LERP LATER 244 148 97
        this.button.tint = this.color

        this.button.position.set(this.data.pos.x, this.data.pos.y)
        this.button.mask = this.mask
        this.base.position.set(this.data.pos.x, this.data.pos.y)
    }

    update(data: ServerButtonData, deltaT: number) {
        if (data.isPressed) {
            this.clickOffset = lerpIt(this.clickOffset, 8, this.LERP_SPEED)
            //WHY DOES THIS WORK LIKE THIS, LIKE FR WHAT PURPUSE DOES THIS HAVEEEEEEEEE
            const r = lerpIt(this.color.toRgb().r * 255, 244, this.LERP_SPEED)
            const g = lerpIt(this.color.toRgb().g * 255, 148, this.LERP_SPEED)
            const b = lerpIt(this.color.toRgb().b * 255, 97, this.LERP_SPEED)

            this.color.setValue({r: r, g: g, b: b})
        } else {
            this.clickOffset = lerpIt(this.clickOffset, 0, this.LERP_SPEED)

            const r = lerpIt(this.color.toRgb().r * 255, 215, this.LERP_SPEED)
            const g = lerpIt(this.color.toRgb().g * 255, 108, this.LERP_SPEED)
            const b = lerpIt(this.color.toRgb().b * 255, 108, this.LERP_SPEED)

            this.color.setValue({r: r, g: g, b: b})
        }

        this.button.tint = this.color
        this.button.position.y = this.data.pos.y + this.clickOffset
    }

    override spawnIn(world: Container) {
        super.spawnIn(world);

        world.addChild(this.base)
        world.addChild(this.mask)
    }

    override beGone(world: Container) {
        super.beGone(world)

        world.removeChild(this.base)
        world.removeChild(this.mask)
    }
}