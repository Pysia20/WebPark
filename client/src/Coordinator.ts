import { Player } from "./Player";
import { ServerData } from "../../shared/commonModels"
import { Texture } from "pixi.js";

export class Coordinator {
//    controlledPlayer: Player probably not needed
    players: Map<number, Player> = new Map
    serverData: ServerData | undefined
    playerTexture: Texture

    constructor(serverData: ServerData, playerTexture: Texture) {
//        this.controlledPlayer = controlledPlayer
        this.playerTexture = playerTexture
        this.update_players(serverData)
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
                newPlayers.push(newPlayer)
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