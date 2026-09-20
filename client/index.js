// temp-ish stuff
import { emitReady } from "./src/Network.ts"

const roomId = document.getElementById("roomId")
const playerName = document.getElementById("playerName")
const joinButton = document.getElementById("joinRoom")
const createButton = document.getElementById("createRoom")
const readyButton = document.getElementById("readyButton")

let isReady = false

createButton.addEventListener("click",  async () => {
    let response = await (await fetch("/createRoom", {method: "post"})).json()
    sessionStorage.setItem("userUUID", response["userUUID"])
    sessionStorage.setItem("userName",playerName.value)
    window.location.href = "/game/" + response["roomID"]
})

joinButton.addEventListener("click",  async () => {
    let response = await (await fetch("joinRoom/" + roomId.value, {method: "get"})).json()
    sessionStorage.setItem("userUUID", response["userUUID"])
    sessionStorage.setItem("userName",playerName.value)
    window.location.href = "/game/" + response["roomID"]
})

readyButton.addEventListener("click", async () => {
    emitReady(isReady)
    isReady = !isReady
})