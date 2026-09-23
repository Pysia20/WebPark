const roomId = document.getElementById("roomId") as HTMLInputElement
const playerName = document.getElementById("playerName") as HTMLInputElement
const playerColor = document.getElementById("playerColor") as HTMLInputElement
const joinButton = document.getElementById("joinRoom") as HTMLButtonElement
const createButton = document.getElementById("createRoom") as HTMLButtonElement

const colorPreview = document.getElementById("colorPreview") as HTMLLabelElement

playerColor.addEventListener("input", () => {
    colorPreview.style.setProperty("--player-color", playerColor.value)
})

createButton.addEventListener("click",  async () => {
    let response = await (await fetch("/api/createRoom", {method: "post"})).json()
    sessionStorage.setItem("userID", response["userID"])
    sessionStorage.setItem("roomID", response["roomID"])
    sessionStorage.setItem("userName", playerName.value)
    sessionStorage.setItem("playerColor", playerColor.value)

    window.location.href = "/game.html"
})

joinButton.addEventListener("click",  async () => {
    let response = await (await fetch("/api/joinRoom/" + roomId.value, {method: "get"})).json()
    sessionStorage.setItem("userID", response["userID"])
    sessionStorage.setItem("roomID", response["roomID"])
    sessionStorage.setItem("userName", playerName.value)
    sessionStorage.setItem("playerColor", playerColor.value)

    window.location.href = "/game.html"
})
