import { Player } from "./Player";
import { PlayerJoinedData, ServerData } from "@shared/commonModels"
import { Container, Color, Text as PixiText } from "pixi.js";
import { PlayerTextures } from "./Assets";

class Coordinator {
    players: Map<number, Player> = new Map
    serverData: ServerData | undefined
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

                const newPlayer = new Player(data.playerID, data.color, this.playerTextures, nick);
                this.players.set(data.playerID, newPlayer);
                (this.world as Container).addChild(newPlayer.sprite);
                (this.world as Container).addChild(newPlayer.nick)
            }
        }
    }

    update_players(serverData: ServerData, deltaTime: number) {
        this.serverData = serverData
        for (const [playerId, playerData] of Object.entries(this.serverData["playerData"])) {
            const tempPlayer = this.players.get(Number(playerId))
                if (tempPlayer) {
                    tempPlayer.targetPos = playerData.pos
                    tempPlayer.updateSprite(playerData.velocity, deltaTime)
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
            (this.world as Container).removeChild(player.sprite);
            (this.world as Container).removeChild(player.nick);
            this.players.delete(playerID)
        }
    }
}

export const coordinator = new Coordinator()