import { Player } from "./Player";
import {PlayerJoinedData, ServerData, ServerPlayerData} from "@shared/commonModels"
import { Container, Text as PixiText } from "pixi.js";
import { PlayerTextures } from "./Assets";

class Coordinator {
    players: Map<number, Player> = new Map
    serverData: Record<number, ServerPlayerData> | undefined
    playerTextures: PlayerTextures = {} as PlayerTextures
    world: Container | undefined

    init(playerTextures: PlayerTextures, world: Container) {
        this.playerTextures = playerTextures
        this.world = world
    }

    create_players(playerData: PlayerJoinedData[]) {
        for (const data of playerData) {
            if (!this.players.has(data.playerID)) {
                const YOUid = Number(sessionStorage.getItem("userID")!)
                const nickColor: string = YOUid == data.playerID ? "#FFD700" : "#ffffff"
                const nick: PixiText = new PixiText({text: data.nick, style: {fill: nickColor, fontSize: 12}, resolution: 2})
                nick.anchor.set(0.5,1)

                const newPlayer = new Player(data.playerID, data.color, nick, this.playerTextures);
                this.players.set(data.playerID, newPlayer);
                newPlayer.addToWorld(this.world as Container)
            }
        }
    }

    update_players(playerData: Record<number, ServerPlayerData>, deltaTime: number) {
        this.serverData = playerData
        for (const [playerId, playerData] of Object.entries(this.serverData)) {
            const tempPlayer = this.players.get(Number(playerId))
                if (tempPlayer) {
                    tempPlayer.targetPos = playerData.pos
                    tempPlayer.checkInAir(playerData.velocity)
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

    remove_player(playerID: number) {
        const player = this.players.get(playerID)
        if(player) {
            player.beGone(this.world as Container)
            this.players.delete(playerID)
        }
    }
}

export const coordinator = new Coordinator()