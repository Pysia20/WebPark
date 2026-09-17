import { Player } from "./Player";

export class Room {
	private id: string | undefined;
	private players: Map<string, Player> = new Map<string, Player>();
	private map: undefined;

	constructor(id: string) {
		this.id = id;
	}

	public getID(): string | undefined {
		return this.id;
	}
	public addPlayer(p: Player) {
		this.players.set(p.getID(), p);
	}
	public removePlayer(uuid: string) {
		this.players.delete(uuid);
	}
}
