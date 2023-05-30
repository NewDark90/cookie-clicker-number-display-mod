import { config } from "./config";
import { NumberFormatter } from "./exponential-formatter";
import { MENU_ON_CHANGE, MenuHandler, MenuKeys } from "./menu-handler";
import { NumberDetails } from "./number-details";

const originalBeautify = globalThis.Beautify;

export type DisplayModOptions = {
    format: MenuKeys;
}

export class DisplayMod implements Game.Mod 
{   
    private options: Partial<DisplayModOptions>;
    private menuHandler = new MenuHandler("#menu");
    private numberFormatter = new NumberFormatter();

    constructor() {
        this.options = { 
            format: "triple-zero-x" 
        };
    }

    private isRawFormat() { return Game.prefs.format == 1; }

    // 'disabled' is a property that the steam version sets to track if it's disabled or not.
    private _disabled: boolean = false;

    setGlobalBeautify() {
        if (this._disabled) {
            globalThis.Beautify = this.getBaseBeautify();
        } else {
            globalThis.Beautify = this.beautify;
        }
    }

    getBaseBeautify = () => originalBeautify;

    beautify: typeof Beautify = (val: number, floats?: number) =>
    {
        const numberDetails = new NumberDetails(val, floats);
        let decimal = '';
        let output: string;

        if (numberDetails.isExponential && this.isRawFormat())
        {
            return this.numberFormatter.formatExponential(numberDetails, this.options.format);
        }
        else 
        {
            const displayDecimal = (
                floats > 0 && 
                Math.abs(val) < 1000 &&
                Math.floor(numberDetails.fixedNum) != numberDetails.fixedNum
            );

            if (displayDecimal)
                decimal = `.${ numberDetails.fixedStr.split('.')[1] }`;

            val = Math.floor(Math.abs(val));
            if (floats > 0 && numberDetails.fixedNum == val + 1)
                val++;

            output = this.numberFormatter.formatNormal(val, this.isRawFormat())
        }

        const negative = (output == '0' ? false : numberDetails.isNegative);

        return negative ? `-${ output }` : `${ output }${ decimal }`;
    };

    init()
    {
        this.menuHandler.observe();
        this.options.format = this.menuHandler.getSelection();

        globalThis.document.addEventListener(MENU_ON_CHANGE, (event: CustomEvent<MenuKeys>) => {
            this.options.format = event.detail;
            Game.BuildStore();
        })
        
        this.setGlobalBeautify();
    }
    save()
    {
        return JSON.stringify(this.options);
    }
    load(str)
    {
        if (!str) 
            return;
        
        this.options = JSON.parse(str);
        if (this.options.format) {
            this.menuHandler.setSelection(this.options.format);
        }
    }
}