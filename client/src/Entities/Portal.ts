import { Container, Graphics } from "pixi.js";
import { Ent } from "./Ent";
import { ENTITY_VISUAL_CONFIG } from "@shared/commonVariables";
import { ServerLaserEntityData } from "@shared/commonEntityData";
import {pulseer} from "../Shaders";
import {ServerEntityData} from "@shared/commonModels";

export class PortalEnt extends Ent {
    portal: Graphics

    constructor(data: ServerEntityData) {
        const portal = new Graphics()
        super(portal)

        this.portal = portal
        this.portal.position.set(data.pos.x, data.pos.y)
        this.portal.rect(0, 0, data.visualSize.x, data.visualSize.y).fill({color: "#c228ff"})
        this.portal.filters = [pulseer]
    }

    update(data: ServerEntityData, deltaT: number) {
        pulseer.resources.timeUniforms.uniforms.uTime += 0.05 * deltaT;
    }

    /*
    override beGone(world: Container) {

    }

    override spawnIn(world: Container) {

    }

     */
}