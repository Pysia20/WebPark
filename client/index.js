// temp-ish stuff

const roomId = document.getElementById("roomId")
const playerName = document.getElementById("playerName")
const playerColor = document.getElementById("playerColor")
const joinButton = document.getElementById("joinRoom")
const createButton = document.getElementById("createRoom")
const readyButton = document.getElementById("readyButton")

let isReady = false

createButton.addEventListener("click",  async () => {
    let response = await (await fetch("/api/createRoom", {method: "post"})).json()
    sessionStorage.setItem("userId", response["userID"])
    sessionStorage.setItem("roomId", response["roomID"])
    sessionStorage.setItem("userName", playerName.value)
    sessionStorage.setItem("playerColor", playerColor.value)

    window.location.href = "/game.html"
})

joinButton.addEventListener("click",  async () => {
    let response = await (await fetch("/api/joinRoom/" + roomId.value, {method: "get"})).json()
    sessionStorage.setItem("userId", response["userID"])
    sessionStorage.setItem("roomId", response["roomID"])
    sessionStorage.setItem("userName", playerName.value)
    sessionStorage.setItem("playerColor", playerColor.value)

    window.location.href = "/game.html"
})
