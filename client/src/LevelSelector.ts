import {LevelData} from "@shared/commonLevelModels";


class LevelSelector {
    maps!: Map<string, LevelData>
    menu!: HTMLDivElement

    init(maps: Map<string, LevelData>) {
        this.maps = maps
        this.menu = document.querySelector(".levels") as HTMLDivElement
    }

    fill() {
        for (const mapName of this.maps.keys()) {
            const item = document.createElement("div")
            item.classList.add("level")

            const name = document.createElement("p")
            name.innerHTML = mapName

            item.appendChild(name)

            this.menu.appendChild(item)

            console.log("test")
        }
    }
}

export const lvlSelector = new LevelSelector()