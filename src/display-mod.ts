import { NumberFormatter, NumberFormatterOptions } from "./number-formatter";
import { MenuHandler, MenuKeys, OptionsMenuChangeEventDetail } from "./menu-handler";
import { NumberDetails } from "./number-details";
import { beautifyOverride } from "./beautify-override";
import { config } from "./config";
import { IntlNumberCustomFormatter } from "./custom-formatter";

export interface IModSettings {
    format: MenuKeys;
    customFormatLocale: string;
    customFormatOptions: string;
}

export class DisplayMod implements Game.Mod 
{   
    private options: IModSettings;
    private formatterOptions: NumberFormatterOptions;
    private menuHandler = new MenuHandler("#menu");
    private numberFormatter = new NumberFormatter();
    private customBeautifiers: CCSECustomBeautify[];

    constructor() {
        this.options = { 
            format: "triple-zero-x",
            customFormatLocale: "en-US",
            customFormatOptions: ""
        };
        this.formatterOptions = {
            format: this.options.format
        };
    }

    private isRawFormat() { return Game.prefs.format == 1; }

    setGlobalBeautify() {
        beautifyOverride();
        this.customBeautifiers = Game.customBeautify;
        this.customBeautifiers.push(this.beautify);
    }

    beautify: CCSECustomBeautify = (val: number, floats?: number, _ret?: string) =>
    {
        const numberDetails = new NumberDetails(val, floats);
        let decimal = '';
        let output: string;

        if (numberDetails.isExponential && this.isRawFormat())
        {
            return this.numberFormatter.formatExponential(numberDetails, this.formatterOptions);
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
        this.forceLoad();
        this.menuHandler.observe();
        this.options.format = this.menuHandler.selection;

        this.menuHandler.addMenuListener(globalThis.document, (event) => {
            this.options = event.detail;
            this.formatterOptions = { 
                format: this.options.format,
                customFormatter: event.detail.customFormatter
            };

            Game.BuildStore();
        });

        this.setGlobalBeautify();
        Game.BuildStore();
    }
    
    /** Mod hook for settings save. */
    save()
    {
        return JSON.stringify(this.options);
    }

    /** Mod hook for settings load. */
    load(str)
    {
        if (!str) 
            return;
        
        this.options = JSON.parse(str);
        if (this.options.format) {
            this.menuHandler.selection = this.options.format;
            this.menuHandler.customFormatLocale = this.options.customFormatLocale ?? "en-US";
            this.menuHandler.customFormatOptions = this.options.customFormatOptions ?? "";
            this.formatterOptions = { 
                format: this.options.format,
                customFormatter: new IntlNumberCustomFormatter(
                    this.menuHandler.customFormatLocale,
                    this.menuHandler.customFormatOptions
                )
            };
            /*
            this.formatterOptions = { 
                format: this.options.format,
                customFormatter: (
                    this.options.format == "custom" 
                    ? new Intl.NumberFormat(
                        this.options.customFormat?.locale, 
                        this.options.customFormat?.options
                    ) 
                    : null
                )
            };
            */
        }
    }

    private forceLoad() {
        const saveData = Game.modSaveData[config.modId];
        if (saveData) {
            this.load(saveData);
        }
    }
}

globalThis["DisplayMod"] = DisplayMod;