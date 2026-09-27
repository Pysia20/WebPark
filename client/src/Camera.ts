import { Application } from "pixi.js";
import { ServerData, ServerPlayerData, Vector2 } from "../../shared/commonModels";


export class cameraControler {
    world: Application

    LERP_SPEED: number = 0.3

    constructor(world: Application) {
        this.world = world

        this.world.stage.position.set(this.world.canvas.width / 2, this.world.canvas.height / 2)
    }

    update_cam(serverData: ServerData) {
        //really not sure if y position is even needed
        let max: Vector2 = {x: 0, y: 0}
        let min: Vector2 = {x: 0, y: 0}
        for (const player of Object.values(serverData["playerData"]) as ServerPlayerData[]) {
            if (player.pos.x > max.x) max.x = player.pos.x
            if (player.pos.y > max.y) max.y = player.pos.y
            if (player.pos.x < min.x) min.x = player.pos.x
            if (player.pos.y < min.y) min.y = player.pos.y
        }

        const targetPos: Vector2 = {x: (max.x + min.x)/2, y: (max.y + min.y)/2}
        const space: Vector2 = {x: (max.x - min.x) + 10, y: (max.y - min.y) + 10}
        const targetZoom: number = Math.min(this.world.canvas.width / space.x, this.world.canvas.height / space.y)

        console.log(targetPos)

        this.world.stage.pivot.x += (targetPos.x - this.world.stage.pivot.x) * this.LERP_SPEED
        this.world.stage.pivot.y += (targetPos.y - this.world.stage.pivot.y) * this.LERP_SPEED
    }
}