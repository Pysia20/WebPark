import {Color, Container, Sprite} from "pixi.js";
import { Ent } from "./Ent";
import { ServerButtonData } from "@shared/commonEntityData";
import {lerpIt} from "../FavoriteChild";
//TODO: MAGIC VALS RAAAAAAA
export class ButtonEnt extends Ent {
    button: Sprite
    base: Sprite
    data: ServerButtonData

    clickOffset = 0

    LERP_SPEED = 0.3

    constructor(data: ServerButtonData, button: Sprite, base: Sprite) {
        super(button)

        this.data = data
        this.button = button
        this.base = base

        const color = new Color({r: 255, g: 255, b: 255}) //TODO: CONVERT FROM HEX WHEN SETTING AND LERP LATER
        this.button.tint = color
        //TODO BETTER VAR NAMES
        const gap = (data.visualSize.x - button.getSize().width) / 2
        const offset = (button.getSize().height - data.visualSize.y)
        this.button.position.set(data.pos.x + gap, data.pos.y - offset)
        const space = (data.visualSize.y - base.getSize().height)
        this.base.position.set(data.pos.x, data.pos.y)
    }

    update(data: ServerButtonData, deltaT: number) {
        if (data.isPressed) {
            this.clickOffset = lerpIt(this.clickOffset, 10, this.LERP_SPEED)
        } else {
            this.clickOffset = lerpIt(this.clickOffset, 0, this.LERP_SPEED)
        }

        this.button.position.y = this.data.pos.y + this.clickOffset
    }

    override spawnIn(world: Container) {
        super.spawnIn(world);

        world.addChild(this.base)
    }

    override beGone(world: Container) {
        super.beGone(world)

        world.removeChild(this.base)
    }
}