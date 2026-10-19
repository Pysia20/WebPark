import {PlayerInputs, Vector2} from "@shared/commonModels"
import {Application, Container} from "pixi.js";

let Inputs = new Set<string>
let mousePos: Vector2 = {x: 0, y: 0}

addEventListener("keydown", (e) => {
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault()
    Inputs.add(e.code)
})
addEventListener("keyup", (e) => Inputs.delete(e.code))



window.addEventListener("blur", () => {
    Inputs.clear()
    mousePos.x = 0
    mousePos.y = 0
})

export function getCurrentInputs() : PlayerInputs {
    return {
        left: Inputs.has("KeyA") || Inputs.has("ArrowLeft"),
        right: Inputs.has("KeyD") || Inputs.has("ArrowRight"),
        jump: Inputs.has("KeyW") || Inputs.has("ArrowUp") || Inputs.has("Space")
    }
}

export function createMouseListiner(app: Application, world: Container) {
    app.stage.on("pointermove", (e) => {
        const worldCords = world.toLocal(e.global)

        mousePos.x = worldCords.x
        mousePos.y = worldCords.y
    })

    app.stage.on("pointerleave", (e) => {
        mousePos.x = 0
        mousePos.y = 0
    })
}

export function getCurrentMousePos() {
    return mousePos
}