//import { RollupOptions } from "rollup";
import typescript from '@rollup/plugin-typescript';
import copy from "rollup-plugin-copy-assets";
import del from 'rollup-plugin-delete'
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
        copy({
            assets: [
                "src/info.txt",
            ],
        }),
    ]
};

export default options;