
export function htmlToNode<TNodeType = HTMLElement>(html: string): TNodeType {
   return htmlToNodes(html)[0] as TNodeType;
}

export function htmlToNodes(html: string): NodeListOf<ChildNode> {
   const template = document.createElement('template');
   template.innerHTML = html?.trim();
   return template.content.childNodes;
}

export function tryParseJson<T = unknown>(json: string): { success: boolean; value: T; } {

    try {
        return {
            success: true,
            value: JSON.parse(json)
        }
    }
    catch(err) {
        return {
            success: false,
            value: undefined
        }
    }
}