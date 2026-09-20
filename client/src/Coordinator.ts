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
        console.log("test3")
        this.serverData = serverData
        const newPlayers: Player[] = []
        for (const [playerId, playerData] of Object.entries(this.serverData["playerData"])) {
            const tempPlayer = this.players.get(playerId)
            if (tempPlayer) {
                console.log("test1")
                tempPlayer.targetPos = playerData.pos
                tempPlayer.updateDirection(playerData.velocity)
            } else {
                console.log("test2")
                const newPlayer: Player = new Player(this.players.size, "#000000", this.playerTextures)
                newPlayer.pos = playerData.pos
                this.players.set(playerId, newPlayer)
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