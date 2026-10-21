import { Container } from "pixi.js";
import { AnyEntityData } from "@shared/commonEntityData";

export abstract class Ent {
    theThing: Container
    data: AnyEntityData = {} as AnyEntityData

    constructor(theThing: Container) {
        this.theThing = theThing
    }

    abstract update(data: AnyEntityData, deltaT: number): void
}