import { io } from "socket.io-client"
import { ServerData, PlayerInputs, RegisterUserData, PlayerJoinedData, ServerEntityData, SomethingBrokeData } from "@shared/commonModels"
import { coordinator } from "./Coordinator";
import { hud } from "./Hud";
import {levelManager} from "./Leveler";

const socket = io("/player", {
    path: '/api/socket.io',
    autoConnect: false
})
let serverData: ServerData | undefined

socket.on("connect_error", (error) => {
    console.log("Failed connection! error:", error)
})

socket.on("connect", () => {
     console.log("Connected! id:", socket.id)
    const roomId = sessionStorage.getItem("roomID") as string
    const id = Number(sessionStorage.getItem("userID"))
    const userName = sessionStorage.getItem("userName") as string
    const color = sessionStorage.getItem("playerColor") as string

    const payload: RegisterUserData = {
          roomID: roomId,
        userID: id,
        userNick: userName,
        color: color
    }
    socket.emit("registerUser", payload, (e: unknown) => {
        console.log(e);
    })
})

socket.on("disconnect", (reason) => {
    console.log("Disconnected! reason:", reason)
})

socket.on("somethingBroke", (whatBroke: SomethingBrokeData) => {
    alert("SOMETHING BROKE SERVERSIDE! CHECK CONSOLE!")
    console.log("KABOOM! " + whatBroke.eventName + ": " + whatBroke.name + ", " + whatBroke.message)
})

socket.on("tick", (newServerData: ServerData) => {
    serverData = newServerData

})

socket.on("playerJoined", (data: PlayerJoinedData[]) => {
    coordinator.create_players(data)
    hud.updateHud()
})

socket.on("playerLeft", (playerID: number) => {
    coordinator.remove_player(playerID)
})



export function startNetworking() {
    socket.connect()
}

export function emitInputs(data: PlayerInputs) {
    socket.emit("playerInputs", data)
}

export function getServerData() {
    return serverData
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

export function onPlayerJoin(func: () => void) {
    socket.on("playerJoined", () => {
        func()
    })
}

export function onPlayerLeave(func: () => void) {
    socket.on("playerLeft", () => {
        func()
    })
}

export function onReadyUpdate(func: (readys: number) => void) {
    socket.on("readyUpdate", (readys: number) => {
        func(readys)
    })
}