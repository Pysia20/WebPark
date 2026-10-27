import {Graphics, Sprite, Texture} from "pixi.js";
import { Ent } from "./Ent";
import {pulseer, spinner} from "../Shaders";
import {ServerEntityData} from "@shared/commonModels";

export class PortalEnt extends Ent {
    portal: Sprite

    constructor(data: ServerEntityData) {
        const placeHolder = new Sprite(Texture.WHITE)
        placeHolder.tint = "#676767"
        super(placeHolder)

        this.portal = placeHolder
        this.portal.position.set(data.pos.x, data.pos.y)
        this.portal.setSize(data.visualSize.x, data.visualSize.y)
    //    this.portal.rect(0, 0, data.visualSize.x, data.visualSize.y).fill({color: "#c228ff"})
        this.portal.filters = [spinner]
    }

    update(data: ServerEntityData, deltaT: number) {
        spinner.resources.timeUniforms.uniforms.uTime += deltaT * 0.01
    }

    /*
    override beGone(world: Container) {

    }

    override spawnIn(world: Container) {

    }

     */
}