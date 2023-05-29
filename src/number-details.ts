export interface TripleZeroNumber {
    reducedValue: number;
    tripleZeroCount: number;
}

export class NumberDetails 
{
    public readonly isNegative: boolean;
    public readonly isExponential: boolean;
    public readonly fixedStr: string;
    public readonly fixedNum: number;

    constructor(
        public readonly val: number,
        public readonly floats?: number
    ) 
    {
        this.fixedStr = val.toFixed(floats);
        this.fixedNum = parseFloat(this.fixedStr);
        this.isNegative = (val < 0);
        this.isExponential = this.fixedStr.indexOf('e+') != -1;
    }
}
