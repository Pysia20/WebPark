import { Player } from "./player";
import { ServerData } from "../../shared/commonModels"

export class Coordinator {
    controledPlayer: Player
    Players: Map<number, Player>
    serverData: ServerData | undefined

    constructor(controledPlayer: Player, Players: Map<number, Player>) {
        this.controledPlayer = controledPlayer
        this.Players = Players
    }

    update_players(serverData: ServerData) {
        this.serverData = serverData
        for (const playerData of this.serverData.playerData) {
            //work in progress
        }

    }
}