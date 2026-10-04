import { Container, Rectangle } from "pixi.js";
import { ServerData, ServerPlayerData, Vector2 } from "@shared/commonModels";
import {PLAYER_CONFIG} from "@shared/commonVariables";


export class cameraController {
    world: Container
    screen: Rectangle
    map_size: Vector2

    LERP_SPEED: number = 0.3

    constructor(world: Container,screen: Rectangle, map_size: Vector2) {
        this.world = world
        this.screen = screen

        this.world.position.set(this.screen.width / 2, this.screen.height / 2)
        this.map_size = {x: map_size.x, y: map_size.y}
    }

    update_cam(serverData: ServerData) {
        let max: Vector2 = {x: -Infinity, y: -Infinity}
        let min: Vector2 = {x: Infinity, y: Infinity}
        for (const player of Object.values(serverData["playerData"]) as ServerPlayerData[]) {
            if (player.pos.x > max.x) max.x = player.pos.x
            if (player.pos.y > max.y) max.y = player.pos.y
            if (player.pos.x < min.x) min.x = player.pos.x
            if (player.pos.y < min.y) min.y = player.pos.y
        }

        const space: Vector2 = {x: (max.x - min.x) + (PLAYER_CONFIG.WIDTH * 2), y: (max.y - min.y) + (PLAYER_CONFIG.HEIGHT * 2)}
        const rawZoom: number = Math.min(this.screen.width / space.x, this.screen.height / space.y)
        const targetZoom: number = Math.min(Math.max(rawZoom, 0.6), 1.5)

        const spacer = 32
        const rawPos: Vector2 = {x: (max.x + min.x)/2, y: (max.y + min.y)/2}
        const scaledScreen: Vector2 = {x: (this.screen.width/2) / targetZoom,y: (this.screen.height/2) / targetZoom}
        const targetPos: Vector2 = {x: Math.min(Math.max(rawPos.x, scaledScreen.x - spacer), (this.map_size.x - scaledScreen.x) + spacer), y: Math.min(Math.max(rawPos.y, scaledScreen.y + spacer), (this.map_size.y - scaledScreen.y) + spacer)}


        this.world.pivot.x += (targetPos.x - this.world.pivot.x) * this.LERP_SPEED
        this.world.pivot.y += (targetPos.y - this.world.pivot.y) * this.LERP_SPEED
        this.world.scale.x += (targetZoom - this.world.scale.x) * this.LERP_SPEED
        this.world.scale.y += (targetZoom - this.world.scale.y) * this.LERP_SPEED
    }
}