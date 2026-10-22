import { Sprite } from "pixi.js";
import { ServerEntityData } from "@shared/commonModels";
import { Ent } from "./Ent";

export class JohnEnt extends Ent {
    sprite: Sprite
    data: ServerEntityData

    constructor(data: ServerEntityData, sprite: Sprite) {
        super(sprite)

        this.data = data
        this.sprite = sprite
    }

    update(data: ServerEntityData, deltaT: number) {
        this.sprite.position.set(data.pos.x, data.pos.y)
        this.sprite.setSize(data.visualSize.x, data.visualSize.y)
    }
}

/*
	renderEnt(entId: number) {
		const ent = this.ents[entId]
		if (!ent.sprite) {
			ent.sprite = this.checkEntTexture(ent.data.type)
			this.world.addChild(ent.sprite)
		}

		ent.sprite.position.set(ent.data.pos.x, ent.data.pos.y)
		ent.sprite.setSize(ent.data.visualSize.x, ent.data.visualSize.y)

		switch (ent.data.type) {
			case "ButtonDoor":
				const doorData = ent.data as ServerButtonDoorData
				ent.sprite.alpha = doorData.isOpen ? 0.1 : 1
				break
			case "Button":
				const buttonData = ent.data as ServerButtonData
				ent.sprite.alpha = buttonData.isPressed ? 0.5 : 1
				break
			case "Laser":

			default:
				break
		}
 */