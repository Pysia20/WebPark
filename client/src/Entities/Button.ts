import {Color, Container, Graphics, Sprite} from "pixi.js";
import { Ent } from "./Ent";
import { ServerButtonData } from "@shared/commonEntityData";
import {lerpIt} from "../FavoriteChild";
import {ENTITY_VISUAL_CONFIG} from "@shared/commonVariables";

export class ButtonEnt extends Ent {
    button: Sprite
    base: Sprite
    mask: Graphics
    data: ServerButtonData

    clickOffset: number = 0
    color: Color = new Color(ENTITY_VISUAL_CONFIG.BUTTON.OFF_COLOR)

    LERP_SPEED = ENTITY_VISUAL_CONFIG.BUTTON.LERP
    ON_COLOR = {r: 0, g: 0, b: 0}
    OFF_COLOR= {r: 0, g: 0, b: 0}

    constructor(data: ServerButtonData, button: Sprite, base: Sprite, gridSize: number) {
        super(button)

        this.ON_COLOR = new Color(ENTITY_VISUAL_CONFIG.BUTTON.ON_COLOR).toRgb()
        this.OFF_COLOR = new Color(ENTITY_VISUAL_CONFIG.BUTTON.OFF_COLOR).toRgb()
        this.ON_COLOR = {r: this.ON_COLOR.r * 255, g: this.ON_COLOR.g * 255, b: this.ON_COLOR.b * 255}
        this.OFF_COLOR = {r: this.OFF_COLOR.r * 255, g: this.OFF_COLOR.g * 255, b: this.OFF_COLOR.b * 255}

        this.data = data
        const offset = gridSize - this.data.visualSize.y
        this.data.pos.y -= offset

        this.button = button
        this.base = base
        this.mask = new Graphics().rect(this.data.pos.x, this.data.pos.y, gridSize, gridSize).fill("#ffffff")

        this.button.tint = this.color

        this.button.position.set(this.data.pos.x, this.data.pos.y)
        this.button.mask = this.mask
        this.base.position.set(this.data.pos.x, this.data.pos.y)
    }

    update(data: ServerButtonData, deltaT: number) {
        if (data.isPressed) {
            this.clickOffset = lerpIt(this.clickOffset, 8, this.LERP_SPEED)
            const rgb = this.color.toRgb()
            rgb.r = lerpIt(rgb.r * 255, this.ON_COLOR.r, this.LERP_SPEED)
            rgb.g = lerpIt(rgb.g * 255, this.ON_COLOR.g, this.LERP_SPEED)
            rgb.b = lerpIt(rgb.b * 255, this.ON_COLOR.b, this.LERP_SPEED)

            this.color.setValue(rgb)
        } else {
            this.clickOffset = lerpIt(this.clickOffset, 0, this.LERP_SPEED)

            const rgb = this.color.toRgb()
            rgb.r = lerpIt(rgb.r * 255, this.OFF_COLOR.r, this.LERP_SPEED)
            rgb.g = lerpIt(rgb.g * 255, this.OFF_COLOR.g, this.LERP_SPEED)
            rgb.b = lerpIt(rgb.b * 255, this.OFF_COLOR.b, this.LERP_SPEED)

            this.color.setValue(rgb)
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