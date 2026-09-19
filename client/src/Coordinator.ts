import { Player } from "./Player";
import { ServerData } from "../../shared/commonModels"
import {Application, Texture} from "pixi.js";

export class Coordinator {
    players: Map<number, Player> = new Map
    serverData: ServerData | undefined
    playerTexture: Texture
    world: Application

    constructor(playerTexture: Texture, world: Application) {
        this.playerTexture = playerTexture
        this.world = world
    }

    update_players(serverData: ServerData) {
        this.serverData = serverData
        const newPlayers: Player[] = []
        for (const playerData of this.serverData.playerData) {
            const tempPlayer = this.players.get(playerData.playerId)
            if (tempPlayer) {
                tempPlayer.targetPos = playerData.pos
            } else {
                const newPlayer: Player = new Player(this.players.size, "#000000", this.playerTexture)
                this.players.set(playerData.playerId, newPlayer)
                this.world.stage.addChild(newPlayer.sprite)
            }
        }
        return newPlayers
    }

    update_positions() {
        for (const [id, player] of this.players) {
            player.updatePos()
        }
    }
}