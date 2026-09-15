let Inputs = new Set<string>;

addEventListener("keydown", (e) => Inputs.add(e.code))
addEventListener("keyup", (e) => Inputs.delete(e.code))

export function getCurrentInputs() {
    return {
        Left: Inputs.has("KeyA") || Inputs.has("ArrowLeft"),
        Right: Inputs.has("KeyD") || Inputs.has("ArrowRight"),
        Jump: Inputs.has("KeyW") || Inputs.has("ArrowUp") || Inputs.has("Space")
    }
}