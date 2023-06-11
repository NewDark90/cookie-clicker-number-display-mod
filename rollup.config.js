//import { RollupOptions } from "rollup";
import typescript from '@rollup/plugin-typescript';
import del from 'rollup-plugin-delete';
import command from 'rollup-plugin-command';
import copy from 'rollup-plugin-copy-assets';

import * as dotenv from "dotenv";

dotenv.config();

const modVersion = parseInt(process.env.MOD_VERSION ?? "1");

const options = {
    input: 'src/index.ts',
    output: {
        file: `dist/${process.env.MOD_ID}/main.js`,
        name: "DISPLAY_MOD",
        format: "iife"
    },
    plugins: [
        del({ targets: 'dist/*' }),
        typescript(),
        //Updating with the thumbnail will break.
        //https://reddit.com/r/CookieClicker/comments/rrb9tj/error_publishing_to_workshop/
        copy({ assets: modVersion == 1 ? [ "src/thumbnail.png" ] : []}),
        command(`node scripts/write-info.js`),
    ]
};

export default options;