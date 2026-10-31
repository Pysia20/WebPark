import {Sprite, Texture} from "pixi.js";
import {PLAYER_CONFIG, PLAYER_VISUAL_CONFIG} from "@shared/commonVariables";
import {Vector2} from "@shared/commonModels";
import {lerpIt} from "../FavoriteChild";

export class Torso {
    color: string
    sprite: Sprite
    lean: number = 0
    sign: number = 1

    LERP_SPEED: number = PLAYER_VISUAL_CONFIG.TORSO.LERP

    constructor(texture: Texture, color: string) {
        this.color = color
        this.sprite = new Sprite(texture)
        this.sprite.tint = this.color
        this.sprite.setSize(PLAYER_CONFIG.WIDTH, PLAYER_CONFIG.HEIGHT * PLAYER_VISUAL_CONFIG.TORSO.HEIGHT_RATIO)
        this.sprite.anchor.set(0.5, 1.0)
    }

    updateTorso(pos: Vector2, velocity: Vector2, isPushing: boolean) {
        this.sprite.position.set(pos.x + (PLAYER_CONFIG.WIDTH / 2), pos.y + (PLAYER_CONFIG.HEIGHT * PLAYER_VISUAL_CONFIG.TORSO.HEIGHT_RATIO))
        if (velocity.x != 0) this.sign = Math.sign(velocity.x)

        if (isPushing) {
            this.lean = lerpIt(this.lean, (this.sign * PLAYER_VISUAL_CONFIG.TORSO.PUSH_LEAN_RATIO), this.LERP_SPEED)
        } else {
            const ratio = Math.abs(velocity.x / (PLAYER_CONFIG.MAX_HORIZONTAL_SPEED * PLAYER_VISUAL_CONFIG.TORSO.LEAN))
            this.lean = lerpIt(this.lean, (this.sign * (ratio ** PLAYER_VISUAL_CONFIG.TORSO.LEAN)), this.LERP_SPEED)
        }

        this.sprite.rotation = this.lean;

        //not rly usefull rn but if we ever add the face drawing it will be
        const baseScaleX = Math.abs(this.sprite.scale.x)
        if (velocity.x < 0) {
            this.sprite.scale.x = -baseScaleX
        } else if (velocity.x > 0) {
            this.sprite.scale.x = baseScaleX
        }
    }
}