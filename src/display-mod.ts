import { config } from "./config";
import { NumberDetails } from "./number-details";

const originalBeautify = globalThis.Beautify;

export class DisplayMod implements Game.Mod 
{   
    constructor() {
        
    }

    private isRawFormat() { return Game.prefs.format == 1; }

    private formatNormal(val: number) 
    {
        let formatted = numberFormatters[this.isRawFormat() ? 2 : 1](val);
        return `${ formatted }`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    private formatExponential(numberDetails: NumberDetails): string
    {
        return numberDetails.formattedTripleZero();
    }

    // 'disabled' is a property that the steam version sets to track if it's disabled or not.
    private _disabled: boolean = false;
    get disabled(): boolean { return this._disabled; }
    set disabled(value: boolean) {  this._disabled = value; this.setGlobalBeautify(); }

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
            return this.formatExponential(numberDetails);
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

            output = this.formatNormal(val)
        }

        const negative = (output == '0' ? false : numberDetails.isNegative);

        return negative ? `-${ output }` : `${ output }${ decimal }`;
    };

    init()
    {
        //this function is called as soon as the mod is registered
        //declare hooks here

        //note: this mod does nothing but show a notification at the bottom of the screen once it's loaded
        Game.Notify(`${config.modId} loaded!`, '', [16, 5]);

        this.setGlobalBeautify();

        /*
        setInterval(() => {
            this.emitModState()              
        }, 1000 * 30)
        */
    }
    save()
    {
        //use this to store persistent data associated with your mod
        return "";
    }
    load(str)
    {
        //do stuff with the string data you saved previously
    }

    emitModState() 
    {
        Game.Notify(`${config.modId} state`, JSON.stringify(this), [16, 5]);
    }
}