import { NumberDetails } from "./number-details";
import { NumberFormatterOptions } from "./number-formatter";
import { tryParseJson } from "./util";

export interface ICustomFormatter {
    isValid: boolean | null;
    format(number: NumberDetails): string;
}

export class IntlNumberCustomFormatter implements ICustomFormatter {

    optionsStr: string;
    options: Intl.NumberFormatOptions | null;
    isValid: boolean = false;
    formatter: Intl.NumberFormat = null;

    constructor(
        public locale: string,
        optionsParam: string | Intl.NumberFormatOptions
    ) {
        if (!this.locale) 
            this.locale = "en-US";

        if (optionsParam == null) {
            this.isValid = null;
            this.options = {};
        }
        else if (typeof optionsParam === "string") {
            this.optionsStr = optionsParam;
            const tryResult = tryParseJson(optionsParam);
            this.options = tryResult.value as Intl.NumberFormatOptions;
            this.isValid = tryResult.success;
            
            if (!optionsParam?.length) {
                this.isValid = null;
            }  
        } else if (typeof optionsParam === "object") {
            this.options = optionsParam;
            this.optionsStr = JSON.stringify(optionsParam);
            this.isValid = true;
        } else {
            throw new Error("IntlNumberCustomFormatter options parameters not valid.");
        }
         
        if (this.isValid !== false) {
            try {
                this.formatter = new Intl.NumberFormat(
                    this.locale,
                    this.options
                );
            }
            catch(err) {
                console.warn("Could not create a formatter. Might be simply due to incomplete settings being typed out.", err);
                this.isValid = false;
            }
        }
    }

    format(number: NumberDetails): string {
        if (this.isValid === false) { 
            return "BadCustomFormat";
        }
        return this.formatter.format(number.val);
    }
}
