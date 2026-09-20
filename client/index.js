// temp-ish stuff

const roomId = document.getElementById("roomId")
const playerName = document.getElementById("playerName")
const joinButton = document.getElementById("joinRoom")
const createButton = document.getElementById("createRoom")
const readyButton = document.getElementById("readyButton")

let isReady = false

createButton.addEventListener("click",  async () => {
    let response = await (await fetch("/createRoom", {method: "post"})).json()
    sessionStorage.setItem("userUUID", response["userUUID"])
    sessionStorage.setItem("roomId", response["roomID"])
    sessionStorage.setItem("userName",playerName.value)

    window.location.href = "/game.html"
})

joinButton.addEventListener("click",  async () => {
    let response = await (await fetch("/joinRoom/" + roomId.value, {method: "get"})).json()
    sessionStorage.setItem("userUUID", response["userUUID"])
    sessionStorage.setItem("roomId", response["roomID"])
    sessionStorage.setItem("userName",playerName.value)

    window.location.href = "/game.html"
})