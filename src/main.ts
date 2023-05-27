import { DisplayMod } from "./display-mod";
import { config } from "./config";

const displayMod = new DisplayMod();

Game.registerMod(config.modId, displayMod);