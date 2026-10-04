const roomId = document.getElementById("roomId") as HTMLInputElement
const playerName = document.getElementById("playerName") as HTMLInputElement
const playerColor = document.getElementById("playerColor") as HTMLInputElement
const joinButton = document.getElementById("joinRoom") as HTMLButtonElement
const createButton = document.getElementById("createRoom") as HTMLButtonElement
const errorBox = document.getElementById("errorMessage") as HTMLParagraphElement

const colorPreview = document.getElementById("colorPreview") as HTMLLabelElement

playerColor.addEventListener("input", () => {
    colorPreview.style.setProperty("--player-color", playerColor.value)
})

createButton.addEventListener("click",  async () => {
    if (playerName.value != "") {
        let response = await (await fetch("/api/createRoom", {method: "post"})).json()
        sessionStorage.setItem("userID", response["userID"])
        sessionStorage.setItem("roomID", response["roomID"])
        sessionStorage.setItem("userName", playerName.value)
        sessionStorage.setItem("playerColor", playerColor.value)

        window.location.href = "/game.html"
    } else {
        errorBox.innerHTML = ""
        playerName.classList.remove("wrongInput")
        roomId.classList.remove("wrongInput")
        if (playerName.value == "") {
            errorBox.innerText = "NAME YOURSELF!"
            playerName.classList.add("wrongInput")
        }
    }
})

joinButton.addEventListener("click",  async () => {
    if (playerName.value != "" && roomId.value.length == 6) {
        let response = await (await fetch("/api/joinRoom/" + roomId.value.toUpperCase(), {method: "get"})).json()
        sessionStorage.setItem("userID", response["userID"])
        sessionStorage.setItem("roomID", response["roomID"])
        sessionStorage.setItem("userName", playerName.value)
        sessionStorage.setItem("playerColor", playerColor.value)

        window.location.href = "/game.html"
    } else {
        errorBox.innerHTML = ""
        playerName.classList.remove("wrongInput")
        roomId.classList.remove("wrongInput")
        if (playerName.value == "") {
            errorBox.innerText = "NAME YOURSELF!"
            playerName.classList.add("wrongInput")
        }
        if (roomId.value.length != 6) {
            errorBox.innerText += " WRONG ROOM ID!"
            roomId.classList.add("wrongInput")
        }
    }
})
