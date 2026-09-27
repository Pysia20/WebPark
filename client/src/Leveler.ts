import { LevelData } from "../../shared/commonModels";
import level0Data from "../../shared/maps/Level_0.json";
import {Assets, Container, loadJson, loadTextures, Rectangle, Sprite, Texture} from "pixi.js";

export class levelManager {
    mapData: LevelData
    world: Container<any>
    spriteSheet: Texture  //TEMP?

    constructor(world: Container, sprites: Texture) {
        this.mapData = level0Data as LevelData
        this.world = world
        this.spriteSheet = sprites
    }

    loadLevel() {
        for (const layer of this.mapData.layerInstances.reverse()) {
            if (!layer.visible) continue

            const tiles = layer.gridTiles.length > 0 ? layer.gridTiles : layer.autoLayerTiles

            for (const tile of tiles) {
                const tileFrame = new Rectangle(0, 0, layer.__gridSize, layer.__gridSize)
                const tileTexture = new Texture({source: this.spriteSheet.source, frame: tileFrame})
                const sprite = new Sprite(tileTexture)
                sprite.position.set(tile.px[0], tile.px[1])
                this.world.addChild(sprite)
            }
        }
    }
}