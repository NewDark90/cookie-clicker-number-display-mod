
import { MenuKeys } from "./menu-handler";
import { NumberDetails, TripleZeroNumber } from "./number-details";

export class NumberFormatter 
{
    formatExponential(numberDetails: NumberDetails, format: MenuKeys): string
    {
        if (format === "triple-zero-x") 
        {
            return this.formatTripleZero(numberDetails);
        } 
        else if (format === "nine-point-exponent") 
        {
            return numberDetails.val.toPrecision(10);
        }
        else if (format === "dot-thousands") 
        {
            return this.formatDotThousands(numberDetails);
        }
        else if (format === "no-short") 
        {
            return this.formatNoShort(numberDetails);
        }

        return numberDetails.val.toPrecision(3);
    }

    formatTripleZero(numberDetails: NumberDetails): string 
    {
        const tripleDetails = this.convertToTripleZero(numberDetails, 1000);
        let fixedCount = 6;
        if (tripleDetails.reducedValue > -100 && tripleDetails.reducedValue < 100) fixedCount++; 
        if (tripleDetails.reducedValue > -10 && tripleDetails.reducedValue < 10) fixedCount++; 

        return `${tripleDetails.reducedValue.toFixed(fixedCount)}[${tripleDetails.tripleZeroCount}×000]`;
    }

    formatNoShort(numberDetails: NumberDetails): string
    {
        const tripleDetails = this.convertToTripleZero(numberDetails, 1_000_000_000_000_000);
        tripleDetails.reducedValue = Math.trunc(tripleDetails.reducedValue);
        const leftHalf = this.formatNormal(tripleDetails.reducedValue, true);
        const rightHalf = new Array(tripleDetails.tripleZeroCount).fill("000").join(",")
        return `${leftHalf},${rightHalf}`;
    }

    formatDotThousands(numberDetails: NumberDetails): string 
    {
        const tripleDetails = this.convertToTripleZero(numberDetails, 1_000_000_000_000);
        tripleDetails.reducedValue = Math.trunc(tripleDetails.reducedValue);
        const leftHalf = this.formatNormal(tripleDetails.reducedValue, true);
        const rightHalf = new Array(tripleDetails.tripleZeroCount).fill("•").join("")
        return `${leftHalf},${rightHalf}`;
    }

    formatNormal(val: number, isRawFormat: boolean) 
    {
        let formatted = numberFormatters[isRawFormat ? 2 : 1](val);
        return `${ formatted }`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    convertToTripleZero(numberDetails: NumberDetails, range: number = 1000): TripleZeroNumber
    {
        let result: TripleZeroNumber = {
            reducedValue: numberDetails.val,
            tripleZeroCount: 0
        };
        const max = Math.abs(range);
        const min = max * -1;

        while (result.reducedValue <= min || result.reducedValue >= max) 
        {
            result.tripleZeroCount += 1;
            result.reducedValue = result.reducedValue * 0.001;
        }
        return result;
    }
}