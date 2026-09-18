import { PlayerInputs } from "../../shared/commonModels"

let Inputs = new Set<string>;

addEventListener("keydown", (e) => Inputs.add(e.code))
addEventListener("keyup", (e) => Inputs.delete(e.code))

export function getCurrentInputs() : PlayerInputs {
    return {
        left: Inputs.has("KeyA") || Inputs.has("ArrowLeft"),
        right: Inputs.has("KeyD") || Inputs.has("ArrowRight"),
        jump: Inputs.has("KeyW") || Inputs.has("ArrowUp") || Inputs.has("Space")
    }
}