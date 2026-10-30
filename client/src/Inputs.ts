import { PlayerInputs, Vector2 } from "@shared/commonModels";
import { Application, Container } from "pixi.js";
import { emitInputs } from "./Network";
import { CLIENT_CONFIG } from "@shared/commonVariables";

let Inputs = new Set<string>();
let mousePos: Vector2 = { x: 0, y: 0 };
let clicking: boolean = false;

addEventListener("keydown", (e) => {
	if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code))
		e.preventDefault();
	Inputs.add(e.code);
});
addEventListener("keyup", (e) => Inputs.delete(e.code));

window.addEventListener("blur", () => {
	// Inputs.clear()
	mousePos.x = 0;
	mousePos.y = 0;
	clicking = false;
});

export function getCurrentInputs(): PlayerInputs {
	return {
		left: Inputs.has("KeyA") || Inputs.has("ArrowLeft"),
		right: Inputs.has("KeyD") || Inputs.has("ArrowRight"),
		jump: Inputs.has("KeyW") || Inputs.has("ArrowUp") || Inputs.has("Space"),
		cursorPos: mousePos,
	};
}

export function createMouseListiner(app: Application, world: Container) {
	app.stage.on("pointermove", (e) => {
		const worldCords = world.toLocal(e.global);

		mousePos.x = worldCords.x;
		mousePos.y = worldCords.y;
	});

	app.stage.on("pointerdown", (e) => {
		clicking = true;
	});

	app.stage.on("pointerup", (e) => {
		clicking = false;
	});

	app.stage.on("pointerleave", (e) => {
		mousePos.x = 0;
		mousePos.y = 0;
		clicking = false;
	});
}

export function getCurrentMousePos() {
	return mousePos;
}

export function isClicking() {
	return clicking;
}

let previousSent: PlayerInputs = {
	right: false,
	left: false,
	jump: false,
	cursorPos: { x: 0, y: 0 },
};
export function startSendingInputs() {
	setInterval(() => {
		const dataToSend = getCurrentInputs();

		const mouseMoved =
			Math.abs(previousSent.cursorPos.x - dataToSend.cursorPos.x) >
				CLIENT_CONFIG.MOUSE_MARGIN ||
			Math.abs(previousSent.cursorPos.y - dataToSend.cursorPos.y) > CLIENT_CONFIG.MOUSE_MARGIN;
		const keysPressed =
			previousSent.right !== dataToSend.right ||
			previousSent.jump !== dataToSend.jump ||
			previousSent.left !== dataToSend.left;

		if (mouseMoved || keysPressed) {
			emitInputs(dataToSend);
			previousSent = { ...dataToSend, cursorPos: { ...dataToSend.cursorPos } };
		}
	}, 1000 / CLIENT_CONFIG.UPDATE_RATE);
}
