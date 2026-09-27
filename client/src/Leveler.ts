import { LevelData } from "../../shared/commonModels";
import level0Data from "../../shared/maps/Level_0.json";
import { Container, Rectangle, Sprite, Texture } from "pixi.js";

export class levelManager {
    levels: LevelData[]
    mapData: LevelData
    world: Container
    spriteSheet: Texture  //TEMP?

    constructor(world: Container, sprites: Texture, levels: LevelData[]) {
        this.levels = levels
        this.mapData = levels[0]
        this.world = world
        this.spriteSheet = sprites
    }

    loadLevel(level: number) {
        this.mapData = this.levels[level]
    }

    renderLevel() {
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