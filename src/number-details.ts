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

    toTripleZero(): TripleZeroNumber
    {
        let result: TripleZeroNumber = {
            reducedValue: this.val,
            tripleZeroCount: 0
        };

        while (result.reducedValue <= -1000 || result.reducedValue >= 1000) 
        {
            result.tripleZeroCount += 1;
            result.reducedValue = result.reducedValue * 0.001;
        }
        return result;
    }

    formattedTripleZero(): string 
    {
        const tripleDetails = this.toTripleZero();
        let fixedCount = 3;
        if (Math.abs(tripleDetails.reducedValue) < 100) fixedCount++; 
        if (Math.abs(tripleDetails.reducedValue) < 10) fixedCount++; 

        return `${tripleDetails.reducedValue.toFixed(fixedCount)}[${tripleDetails.tripleZeroCount}×000]`;
    }
}
