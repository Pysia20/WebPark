import { Graphics } from "pixi.js";
import { Ent } from "./Ent";
import {pulseer, spinner} from "../Shaders";
import {ServerEntityData} from "@shared/commonModels";

export class PortalEnt extends Ent {
    portal: Graphics

    constructor(data: ServerEntityData) {
        const portal = new Graphics()
        super(portal)

        this.portal = portal
        this.portal.position.set(data.pos.x, data.pos.y)
        this.portal.rect(0, 0, data.visualSize.x, data.visualSize.y).fill({color: "#c228ff"})
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