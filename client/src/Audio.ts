 import { Howl } from "howler";

const jumpSound =  new Howl({src: "/public/sounds/jump.mp3", volume: 1})

 export function playJump() {
    jumpSound.play()
 }