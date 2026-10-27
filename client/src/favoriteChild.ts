
let deltaT = 1.0

function updateLerp(newT: number) {
    deltaT = newT
}

function lerpIt(theThing: number, lerpTarget: number, lerpSpeed: number): {
    const adjustedSpeed = 1 - Math.pow(1 - lerpSpeed, deltaT)
    theThing += (lerpSpeed - theThing) * adjustedSpeed
    return theThing
}

//this.lean += ((this.sign * 0.2) - this.lean) * 0.3