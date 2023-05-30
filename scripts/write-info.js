import { writeFile } from "fs/promises";
import * as dotenv from "dotenv";
dotenv.config();

const today = new Date();

const config = {
	"Name": "Exponent Display Mod",
	"ID": process.env.MOD_ID,
	"Author": "NewDark",
	"Description": "Adds many different options for formatting numbers in exponential notation.",
	"ModVersion": parseInt(process.env.MOD_VERSION),
	"GameVersion": parseFloat(process.env.GAME_VERSION),
	"Date": `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`,
	"Dependencies": [],
	"Disabled": 0,
    "AllowSteamAchievs": 1
};

(async () => {
    await writeFile(
        `dist/${process.env.MOD_ID}/info.txt`, 
        JSON.stringify(config, null, 4 )
    );
})().catch(err => console.error(err))

