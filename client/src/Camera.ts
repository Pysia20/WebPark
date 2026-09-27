import { Application } from "pixi.js";
import { ServerData, ServerPlayerData, Vector2 } from "../../shared/commonModels";


export class cameraControler {
    world: Application
    map_size: Vector2 //WILL BE FILLED WITH DATA FROM SERVER LATER

    LERP_SPEED: number = 0.3

    constructor(world: Application) {
        this.world = world

        this.world.stage.position.set(this.world.screen.width / 2, this.world.screen.height / 2)
        this.map_size = {x: this.world.screen.width * 2, y: this.world.screen.height} //WILL BE FILLED WITH DATA FROM SERVER LATER
    }

    update_cam(serverData: ServerData) {
        //really not sure if y position is even needed
        let max: Vector2 = {x: -Infinity, y: -Infinity}
        let min: Vector2 = {x: Infinity, y: Infinity}
        for (const player of Object.values(serverData["playerData"]) as ServerPlayerData[]) {
            if (player.pos.x > max.x) max.x = player.pos.x
            if (player.pos.y > max.y) max.y = player.pos.y
            if (player.pos.x < min.x) min.x = player.pos.x
            if (player.pos.y < min.y) min.y = player.pos.y
        }

        const space: Vector2 = {x: (max.x - min.x) + 100, y: (max.y - min.y) + 100}
        const rawZoom: number = Math.min(this.world.screen.width / space.x, this.world.screen.height / space.y)
        const targetZoom: number = Math.min(Math.max(rawZoom, 0.6), 1.0)

        const rawPos: Vector2 = {x: (max.x + min.x)/2, y: (max.y + min.y)/2}
        const scaledScreen: Vector2 = {x: (this.world.screen.width/2) / targetZoom,y: (this.world.screen.height/2) / targetZoom}
        const targetPos: Vector2 = {x: Math.min(Math.max(rawPos.x, scaledScreen.x), this.map_size.x - scaledScreen.x), y: Math.min(Math.max(rawPos.y, scaledScreen.y), this.map_size.y - scaledScreen.y)}


        this.world.stage.pivot.x += (targetPos.x - this.world.stage.pivot.x) * this.LERP_SPEED
        this.world.stage.pivot.y += (targetPos.y - this.world.stage.pivot.y) * this.LERP_SPEED
        this.world.stage.scale.x += (targetZoom - this.world.stage.scale.x) * this.LERP_SPEED
        this.world.stage.scale.y += (targetZoom - this.world.stage.scale.y) * this.LERP_SPEED
    }
}