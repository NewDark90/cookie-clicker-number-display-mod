import { copy } from 'fs-extra';
import * as dotenv from "dotenv";
dotenv.config();

(async () => {
    await copy("dist", `${process.env.MOD_FOLDER}/local`, {
        overwrite: true
    });
})().catch(err => console.error(err))