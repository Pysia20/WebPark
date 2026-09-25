import { io } from "socket.io-client"
import {ServerData, PlayerInputs, RegisterUserData, PlayerJoinedData} from "../../shared/commonModels"
import {coordinator} from "./Coordinator";

const socket = io("/player", {
    path: '/api/socket.io'
})
let playerData: ServerData | undefined

socket.on("connect_error", (error) => {
    console.log("Failed connection! error:", error)
})

socket.on("connect", () => {
     console.log("Connected! id:", socket.id)
    const roomId = sessionStorage.getItem("roomID") as string
    const id = Number(sessionStorage.getItem("userID")) as number
    const userName = sessionStorage.getItem("userName") as string
    const color = sessionStorage.getItem("playerColor") as string

    const payload: RegisterUserData = {
          roomID: roomId,
        userID: id,
        userNick: userName,
        color: color
    }
    console.log(payload)
    socket.emit("registerUser", payload, (e: unknown) => {
        console.log(e);
    })
})

socket.on("disconnect", (reason) => {
    console.log("Disconnected! reason:", reason)
})

socket.on("somethingBroke", (whatBroke: unknown) => {
    console.log(whatBroke)
})

socket.on("tick", (data: ServerData) => {
    playerData = data
})

socket.on("playerJoined", (data: PlayerJoinedData[]) => {
    if (coordinator.world) {
        coordinator.create_players(data)
    } else {
        onGameStart(() => {
            coordinator.create_players(data)
        })
    }
})

export function emitInputs(data: PlayerInputs) {
    socket.emit("playerInputs", data)
}

export function getPlayerData() {
    return playerData
}

export function emitReady(isReady: boolean) {
    if (isReady) {
        socket.emit("playerReady", Number(sessionStorage.getItem("userID")))
    } else {
        socket.emit("playerUnReady", Number(sessionStorage.getItem("userID")))
    }
}

export function onGameStart(func: () => void) {
    socket.once("tick", () => {
        func()
    })
}