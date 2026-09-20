import { Player } from "./Player";
import { ServerData } from "../../shared/commonModels"
import { Application } from "pixi.js";
import { PlayerTextures } from "./Assets";

export class Coordinator {
    players: Map<string, Player> = new Map
    serverData: ServerData | undefined
    playerTextures: PlayerTextures
    world: Application

    constructor(playerTextures: PlayerTextures, world: Application) {
        this.playerTextures = playerTextures
        this.world = world
    }

    update_players(serverData: ServerData) {
        this.serverData = serverData
        const newPlayers: Player[] = []
        for (const playerDataId in this.serverData.playerData) {
            const tempPlayer = this.players.get(playerDataId)
            if (tempPlayer) {
                tempPlayer.targetPos = this.serverData.playerData[playerDataId].pos
                tempPlayer.updateDirection(this.serverData.playerData[playerDataId].velocity)
            } else {
                const newPlayer: Player = new Player(this.players.size, "#000000", this.playerTextures)
                newPlayer.pos = this.serverData.playerData[playerDataId].pos
                this.players.set(playerDataId, newPlayer)
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