import * as PIXI from 'pixi.js'

export interface PlayerTextures {
    idle: PIXI.Texture
    walk: PIXI.Texture
    jump: PIXI.Texture
}

export interface Assets {
    playerTextures: PlayerTextures
}

export async function loadAssets() {
    //TEMP IMGS
    const loadedTextures = await PIXI.Assets.load(["/public/sprites/playerPlaceholder.png", "/public/sprites/playerPlaceholderWalk.png", "/public/sprites/playerPlaceholderJump.png"])

    const playerIdle: PIXI.Texture = loadedTextures["/public/sprites/playerPlaceholder.png"]
    const playerWalk: PIXI.Texture = loadedTextures["/public/sprites/playerPlaceholderWalk.png"]
    const playerJump: PIXI.Texture = loadedTextures["/public/sprites/playerPlaceholderJump.png"]
    const playerTextures: PlayerTextures = {idle: playerIdle, walk: playerWalk, jump: playerJump}

    const assets: Assets = {playerTextures: playerTextures}
    return assets
}