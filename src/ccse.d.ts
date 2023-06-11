type CookieClickerScriptExtenderType = {
    isLoaded: 1 | 0;
    postLoadHooks: Array<() => void>;
}

declare type CCSECustomBeautify = (val: number, floats?: number, returnVal?: string) => string;

declare var CCSE: Partial<CookieClickerScriptExtenderType>;

declare namespace Game {
    let customBeautify: Array<CCSECustomBeautify> | undefined
} 