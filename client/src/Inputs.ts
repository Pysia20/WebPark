import { PlayerInputs } from "@shared/commonModels"

let Inputs = new Set<string>

addEventListener("keydown", (e) => {
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault()
    Inputs.add(e.code)
})
addEventListener("keyup", (e) => Inputs.delete(e.code))

window.addEventListener("blur", () => Inputs.clear())

export function getCurrentInputs() : PlayerInputs {
    return {
        left: Inputs.has("KeyA") || Inputs.has("ArrowLeft"),
        right: Inputs.has("KeyD") || Inputs.has("ArrowRight"),
        jump: Inputs.has("KeyW") || Inputs.has("ArrowUp") || Inputs.has("Space")
    }
}