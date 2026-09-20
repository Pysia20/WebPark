import { io } from "socket.io-client"
import { ServerData, ClientData } from  "../../shared/commonModels"

const socket = io("/player", {
    path: '/api/socket.io'
}) //will need to change the address later (probably anyway)
let playerData: ServerData | undefined

socket.on("connect_error", (error) => {
    console.log("Failed connection! error:", error)
})

socket.on("connect", () => {
     console.log("Connected! id:", socket.id)
    const roomId = sessionStorage.getItem("roomId")
    const uuid = sessionStorage.getItem("userUUID")
    const userName = sessionStorage.getItem("userName")
    console.log(roomId)
    socket.emit("registerUser", {
        roomID: roomId,
        userUUID: uuid,
        userNick: userName
    }, (e: string) => {
        console.log(e);
    })
})

socket.on("disconnect", (reason) => {
    console.log("Disconnected! reason:", reason)
})

socket.on("tick", (data: ServerData) => {
    playerData = data
})


export function emitInputs(data: ClientData) {
    socket.emit("playerInputs", data)
}

export function getPlayerData() {
    return playerData
}

export function emitReady(isReady: boolean) {
    if (isReady) {
        socket.emit("playerReady", sessionStorage.getItem("userUUID"))
    } else {
        socket.emit("playerUnReady", sessionStorage.getItem("userUUID"))
    }
}