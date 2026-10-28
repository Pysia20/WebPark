import {Vector2} from "@shared/commonModels";

let deltaT = 1.0

export function updateLerp(newT: number) {
    deltaT = newT
}

export function lerpIt(theThing: number, lerpTarget: number, lerpSpeed: number) {
    const adjustedSpeed = 1 - Math.pow(1 - lerpSpeed, deltaT)

    theThing += (lerpTarget - theThing) * adjustedSpeed
    return theThing
}

export function lerpTheyThem(theThing: Vector2, lerpTarget: Vector2, lerpSpeed: number) {
    const adjustedSpeed = 1 - Math.pow(1 - lerpSpeed, deltaT)

    theThing.x += (lerpTarget.x - theThing.x) * adjustedSpeed
    theThing.y += (lerpTarget.y - theThing.y) * adjustedSpeed
}