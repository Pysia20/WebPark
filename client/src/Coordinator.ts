import { Player } from "./Player";
import { ServerData } from "../../shared/commonModels"
import { Application } from "pixi.js";
import { loadAssets, PlayerTextures } from "./Assets";

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
        for (const [playerId, playerData] of Object.entries(this.serverData["playerData"])) {
            const tempPlayer = this.players.get(playerId)
            if (tempPlayer) {
                tempPlayer.targetPos = playerData.pos
                tempPlayer.updateDirection(playerData.velocity)
            } else {
                const myUUID = localStorage.getItem("userUUID")
                let newPlayer: Player = {} as Player
                if (myUUID == playerId) {
                    newPlayer = new Player(this.players.size, "#ffda7e", this.playerTextures)
                } else {
                    newPlayer = new Player(this.players.size, "#7effff", this.playerTextures)
                }
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