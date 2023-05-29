//import { RollupOptions } from "rollup";
import typescript from '@rollup/plugin-typescript';
import del from 'rollup-plugin-delete';
import command from 'rollup-plugin-command';
import copy from 'rollup-plugin-copy-assets';

import * as dotenv from "dotenv";

dotenv.config();

const options = {
    input: 'src/index.ts',
    output: {
        file: `dist/${process.env.MOD_ID}/main.js`,
        format: "iife"
    },
    plugins: [
        del({ targets: 'dist/*' }),
        typescript(),
        copy({ assets: [ "src/thumbnail.png" ]}),
        command(`node scripts/write-info.js`),
    ]
};

export default options;