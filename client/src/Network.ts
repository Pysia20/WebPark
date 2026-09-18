import { io } from "socket.io-client"
import { ServerData, ClientData } from  "../../shared/commonModels"

const socket = io("http://localhost:3000") //will need to change the address later
let playerData: ServerData

socket.on("connect_error", (error) => {
    console.log("Failed connection! error:", error)
})

 socket.on("connect", () => {
     console.log("Connected! id:", socket.id)
 })

socket.on("disconnect", (reason) => {
    console.log("Disconnected! reason:", reason)
})

socket.on("updatePlayerData", (data: ServerData) => {
    playerData = data
})


export function emitInputs(data: ClientData) {
    socket.emit("playerInputs", data)
}

export function getPlayerData() {
    return playerData
}