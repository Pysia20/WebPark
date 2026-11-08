import { Container, Rectangle } from "pixi.js";
import { ServerData, ServerPlayerData, Vector2 } from "@shared/commonModels";
import {CAMERA_CONFIG, PLAYER_CONFIG} from "@shared/commonVariables";
import {lerpIt, lerpTheyThem} from "./FavoriteChild";


export class CameraController {
    world!: Container
    screen!: Rectangle
    map_size!: Vector2

    SPACER: number = CAMERA_CONFIG.SPACER
    LERP_SPEED: number = CAMERA_CONFIG.LERP

    init(world: Container,screen: Rectangle, map_size: Vector2) {
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

        const space: Vector2 = {x: (max.x - min.x) + (PLAYER_CONFIG.WIDTH * CAMERA_CONFIG.PLAYER_X_SPACER), y: (max.y - min.y) + (PLAYER_CONFIG.HEIGHT * CAMERA_CONFIG.PLAYER_Y_SPACER)}
        const rawZoom: number = Math.min(this.screen.width / space.x, this.screen.height / space.y)
        const targetZoom: number = Math.min(Math.max(rawZoom, CAMERA_CONFIG.MIN_ZOOM), CAMERA_CONFIG.MAX_ZOOM)

        const rawPos: Vector2 = {x: (max.x + min.x)/2, y: (max.y + min.y)/2}
        const scaledScreen: Vector2 = {x: (this.screen.width/2) / targetZoom,y: (this.screen.height/2) / targetZoom}

        const minX = scaledScreen.x - this.SPACER
        const maxX = (this.map_size.x - scaledScreen.x) + this.SPACER
        const targetX = minX > maxX ? this.map_size.x / 2 : Math.min(Math.max(rawPos.x, minX), maxX)

        const minY = scaledScreen.y - this.SPACER
        const maxY = (this.map_size.y - scaledScreen.y) + this.SPACER
        const targetY = minY > maxY ? this.map_size.y / 2 : Math.min(Math.max(rawPos.y, minY), maxY)

        const targetPos: Vector2 = {x: targetX, y: targetY}
        lerpTheyThem(this.world.pivot, targetPos, this.LERP_SPEED)
        this.world.scale.x = lerpIt(this.world.scale.x, targetZoom, this.LERP_SPEED)
        this.world.scale.y = lerpIt(this.world.scale.y, targetZoom, this.LERP_SPEED)
    }

    update_map(size: Vector2) {
        this.map_size = size
    }
}

export const cam = new CameraController()