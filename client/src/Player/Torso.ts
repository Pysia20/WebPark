import {Sprite, Texture} from "pixi.js";
import {PLAYER_CONFIG} from "@shared/commonVariables";
import {Vector2} from "@shared/commonModels";

export class Torso {
    color: string
    sprite: Sprite

    constructor(texture: Texture, color: string) {
        this.color = color
        this.sprite = new Sprite(texture)
        this.sprite.tint = this.color
        this.sprite.setSize(PLAYER_CONFIG.WIDTH, PLAYER_CONFIG.HEIGHT - (PLAYER_CONFIG.HEIGHT / 10))
        this.sprite.anchor.set(0.5, 1.0)
    }

    updateTorso(pos: Vector2, velocity: Vector2) {
        this.sprite.position.set(pos.x + (PLAYER_CONFIG.WIDTH / 2), pos.y + ((PLAYER_CONFIG.HEIGHT / 10) * 9))

        this.sprite.rotation = (velocity.x / (PLAYER_CONFIG.MAX_HORIZONTAL_SPEED * 3)) ** 3 // I think something is wrong server side? PLAYER_CONFIG.MAX_HORIZONTAL_SPEED < max velocity I'm getting TODO: CHECK IF THIS WAS FIXED YOU DUMMY

        //not rly usefull rn but if we ever add the face drawing it will be
        if (velocity.x < 0) {
            this.sprite.scale.x = -1;
        } else if (velocity.x > 0) {
            this.sprite.scale.x = 1;
        }
    }
}