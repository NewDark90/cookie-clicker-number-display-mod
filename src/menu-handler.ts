import { config } from "./config";
import { ICustomFormatter, IntlNumberCustomFormatter } from "./custom-formatter";
import { htmlToNode, tryParseJson } from "./util";

export const MENU_ON_CHANGE = `${config.modId}-OnChange` as const;
export type OptionsMenuChangeEvent = CustomEvent<OptionsMenuChangeEventDetail>
export type OptionsMenuChangeEventDetail = {
    format: MenuKeys;
    customFormatLocale: string;
    customFormatOptions: string;
    customFormatter?: ICustomFormatter;
}
export type MenuKeys =  "base" | "triple-zero-x" |  "nine-point-exponent" | "no-short" | "dot-thousands" | "custom";

export class MenuHandler 
{
    private menuElement: Element;
    private observer: MutationObserver;
    private menuItems: Array<{ value: MenuKeys, display: string, description: string }> = [
        { value: "base", display: "Normal", description: "What the game normally does. Exponential format, 3 digit precision." },
        { value: "nine-point-exponent", display: "Nine Precision", description: "Exponential notation, but with 10 digit precision." },
        { value: "triple-zero-x", display: "Thousand Chunks", description: "Displays within range of 1-1000, with 9 digits of precision. Thousands formatted like [n×000]." },
        { value: "dot-thousands", display: "Thousand Dots", description: "Like \"Unshorten\", but 000 represented by •" },
        { value: "no-short", display: "Unshorten", description: "Forces the regular raw format with trailing zeros. May conflict with styling." },
        { value: "custom", display: "Custom (advanced)", description: 
            `Gives you much more control by allowing you to plug in a javascript configuration based on <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat" target="_blank">Intl.NumberFormat</a>. ` + 
            `Options settings expected as a JSON object, <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat" target="_blank">Number format options defined here</a>. ` 
        },
    ];
    private wrapper: HTMLDivElement;
    private dropdown: HTMLSelectElement;
    private instructionsLabel: HTMLLabelElement;
    private localeInput: HTMLInputElement;
    private optionsInput: HTMLTextAreaElement;
    private validSpan: HTMLSpanElement;

    private _selection: MenuKeys = "triple-zero-x";
    get selection(): MenuKeys { return this._selection }
    set selection(val: MenuKeys) { 
        if (this.dropdown)
            this.dropdown.value = val;
        this._selection = val;
    }

    private _customFormatLocale: string = "en-US";
    get customFormatLocale(): string { return this._customFormatLocale }
    set customFormatLocale(val: string) { 
        if (this.localeInput)
            this.localeInput.value = val;
        this._customFormatLocale = val;
    }

    private _customFormatOptions: string = "{}";
    get customFormatOptions(): string { return this._customFormatOptions }
    set customFormatOptions(val: string) { 
        if (this.optionsInput)
            this.optionsInput.value = val;
        this._customFormatOptions = val;
    }

    constructor(
        private menuSelector: string
    ) 
    {

    }

    observe() 
    {
        if (this.observer) {
            return this.observer;
        }
        
        this.menuElement = globalThis.document.querySelector(this.menuSelector);

        this.buildDom();

        this.observer = new MutationObserver((mutationsList, observer) => {
            const title = [...this.menuElement.querySelectorAll(".title")]
                .filter((title: HTMLElement) => title.innerText == loc("Settings"))[0];

            if (!title)
                return;
            
            const settings = title.parentElement.querySelector(`#${this.wrapper.id}`);

            if (settings)
                return;
            
            title.parentElement.append( this.wrapper );
        });

        this.observer.observe(this.menuElement, {characterData: false, childList: true, attributes: false});
        return this.observer;
    }

    addMenuListener(element: EventTarget, handler: (event: OptionsMenuChangeEvent) => void) {
        element.addEventListener(MENU_ON_CHANGE, handler);
    }

    

    private buildDom() {
        globalThis.document.head.append(this.buildStyles());

        this.wrapper = htmlToNode(`
        <div id="exponential-mod-settings" class="listing">
            <select id="custom-format-type" class="dropdown-setting" value="${this.selection}">
                ${this.menuItems.map(i => `<option value="${i.value}">${i.display}</option>`).join(" ")}
            </select>
            <label id="custom-format-instructions">
                ${this.getSelectionLabelText(this.selection)}
            </label>
            <br>
            <input id="custom-format-locale" class="custom-format-node exponent-mod-setting-input" type="text" value="${this.customFormatLocale}" />
            <label class="custom-format-node" >${this.getLabelText('Custom Format Language (BCP 47 Language Tag)')}</label>
            <br>
            <textarea id="custom-format-options" class="custom-format-node exponent-mod-setting-input">
                ${this.customFormatOptions}
            </textarea>
            <label class="custom-format-node">
                <span id="custom-format-valid"></span>
                ${this.getLabelText('Custom Format Options (JSON format, just paste your settings)')}
            </label>
        </div> 
        `);


        this.dropdown = this.wrapper.querySelector("#custom-format-type");
        this.dropdown.addEventListener("change", () => {
            this.selection = this.dropdown.value as MenuKeys;
            this.instructionsLabel.innerHTML = this.getSelectionLabelText(this._selection);
            this.dispatchMenuChangeEvent(this.dropdown);
        });
        this.instructionsLabel = this.wrapper.querySelector("#custom-format-instructions");
        this.localeInput = this.wrapper.querySelector("#custom-format-locale");
        this.localeInput.addEventListener("input", () => {
            this.customFormatLocale = this.localeInput.value;
            this.dispatchMenuChangeEvent(this.localeInput);
        });
        this.optionsInput = this.wrapper.querySelector("#custom-format-options");
        this.optionsInput.addEventListener("input", () => {
            this.customFormatOptions = this.optionsInput.value;
            this.dispatchMenuChangeEvent(this.optionsInput);
        });
        this.validSpan = this.wrapper.querySelector("#custom-format-valid");

        this.addMenuListener(this.wrapper, (event: OptionsMenuChangeEvent) => {
            const customFormatNodes = this.wrapper.querySelectorAll<HTMLElement>(".custom-format-node");
            customFormatNodes.forEach((element) => {
                const isCustom = event.detail.format === "custom";
                element.style.display = isCustom ? "" : "none";
                if (event.detail.customFormatter?.isValid === true) {
                    this.validSpan.innerHTML = "✅";
                } else if (event.detail.customFormatter?.isValid === false) {
                    this.validSpan.innerHTML = "❌";
                } else {
                    this.validSpan.innerHTML = "";
                }
            });
        });

        this.dispatchMenuChangeEvent(this.validSpan);
    }

    private buildStyles() {
        const style = globalThis.document.createElement("style")
        style.textContent = `
            .exponent-mod-setting-input,
            .dropdown-setting {
                display:inline-block;
                margin:2px 4px 2px 0px;
                color:#ccc;
                font-size:12px;
                padding:4px 8px;
                text-decoration:none;

                border:1px solid #e2dd48;
                border-color:#ece2b6 #875526 #733726 #dfbc9a;
                border-radius:2px;    
                
                font-variant: small-caps;
                font-weight: bold;

                background:#000 url(img/darkNoise.jpg);
                background-image:/*linear-gradient(rgba(255,255,255,0.05),rgba(0,0,0,0.4)),*/url(img/shadedBordersSoft.png),url(img/darkNoise.jpg);
                background-size:/*100% 100%,*/100% 100%,auto;
                background-color:#000;
                box-shadow:0px 0px 1px 2px rgba(0,0,0,0.5),0px 2px 4px rgba(0,0,0,0.25),0px 0px 2px 2px #000 inset,0px 1px 0px 1px rgba(255,255,255,0.5) inset;
                text-shadow:0px 1px 1px #000;
                line-height:100%;
                text-align: right;
            }

            #exponential-mod-settings textarea {
                height: 4em;
                width: 50em;
            }
        `;
        return style;
    }

    private getSelectionLabelText(selection: MenuKeys) 
    {
        return this.getLabelText(this.menuItems.find(item => item.value == selection)?.description);
    }

    private getLabelText(text: string) 
    {
        return `(${config.modId} - ${text})`;
    }

    private dispatchMenuChangeEvent(element: EventTarget) {
        const detail: OptionsMenuChangeEventDetail = {
            format: this.selection,
            customFormatLocale: this.customFormatLocale,
            customFormatOptions: this.customFormatOptions,
        };

        detail.customFormatter = this.selection === "custom" 
            ? new IntlNumberCustomFormatter(this.customFormatLocale, this.customFormatOptions)
            : null;
        
        const event = new CustomEvent<OptionsMenuChangeEventDetail>(MENU_ON_CHANGE, {
            detail: detail,
            bubbles: true,
        });
        element.dispatchEvent(event);
    }
}