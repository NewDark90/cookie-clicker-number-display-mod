import { config } from "./config";

export const MENU_ON_CHANGE = `${config.modId}-OnChange` as const;
export type MenuKeys =  "base" | "triple-zero-x" |  "nine-point-exponent" | "no-short" | "dot-thousands";

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
    ];
    private selection: MenuKeys = "triple-zero-x";
    private wrapper: HTMLDivElement;
    private dropdown: HTMLSelectElement;
    private label: HTMLLabelElement;

    constructor(
        private menuSelector: string
    ) 
    {

    }

    getSelection = () => this.selection;
    setSelection(val: MenuKeys) 
    {
        this.dropdown.value = val;
        this.selection = val;
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

    private buildDom() {
        globalThis.document.head.append(this.buildStyles());
        this.wrapper = this.buildWrapper();
        this.dropdown = this.buildDropdown();
        this.label = this.buildLabel();
        this.wrapper.append(this.dropdown);
        this.wrapper.append(this.label);
    }

    private buildWrapper() 
    {
        const wrapper = globalThis.document.createElement("div");
        wrapper.className = "listing";
        wrapper.id = "exponential-mod-settings";
        return wrapper;
    }

    private buildDropdown() 
    {
        const dropdown = globalThis.document.createElement("select");
        dropdown.className = "dropdown-setting";
        dropdown.innerHTML = this.menuItems.map(i => `<option value="${i.value}">${i.display}</option>`).join(" ");
        dropdown.addEventListener("change", () => {
            this.selection = dropdown.value as MenuKeys;
            this.label.innerHTML = this.getLabelText(this.selection);
            const event = new CustomEvent(MENU_ON_CHANGE, {
                detail: this.selection,
                bubbles: true,
            });
            dropdown.dispatchEvent(event);
        });
        dropdown.value = this.selection;
        return dropdown;
    }

    private buildLabel() {
        const label = globalThis.document.createElement("label");
        label.innerHTML = this.getLabelText(this.selection);
        return label;
    }

    private buildStyles() {
        const style = globalThis.document.createElement("style")
        style.textContent = `
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
        `;
        return style;
    }

    private getLabelText(selection: MenuKeys) 
    {
        return `(${config.modId} - ${this.menuItems.find(item => item.value == selection)?.description})`;
    }
}