import { Player } from "./Player";
import { PlayerJoinedData, ServerData } from "../../shared/commonModels"
import { Application } from "pixi.js";
import { PlayerTextures } from "./Assets";

class Coordinator {
    players: Map<number, Player> = new Map
    serverData: ServerData | undefined
    playerTextures: PlayerTextures = {} as PlayerTextures
    world: Application | undefined

    init(playerTextures: PlayerTextures, world: Application) {
        this.playerTextures = playerTextures
        this.world = world
    }

    create_players(playerData: PlayerJoinedData[]) {
        for (const data of playerData) {
            if (!this.players.has(data.playerID)) {
                const newPlayer = new Player(data.playerID, data.color, this.playerTextures);
                this.players.set(data.playerID, newPlayer);
                (this.world as Application).stage.addChild(newPlayer.sprite);
            }
        }
    }

    update_players(serverData: ServerData) {
        this.serverData = serverData
        for (const [playerId, playerData] of Object.entries(this.serverData["playerData"])) {
            const tempPlayer = this.players.get(Number(playerId))
                if (tempPlayer) {
                    tempPlayer.targetPos = playerData.pos
                    tempPlayer.updateDirection(playerData.velocity)
                } else {
                    console.log("unknown player")
                }
        }
    }

    update_positions() {
        for (const player of this.players.values()) {
            player.updatePos()
        }
    }
}

export const coordinator = new Coordinator()