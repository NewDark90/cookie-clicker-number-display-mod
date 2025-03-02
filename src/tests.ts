import { DisplayMod } from "./display-mod";

function testSetup() 
{
    function formatEveryThirdPower(notations)
    {
        return function (val)
        {
            var base = 0, notationValue = '';
            if (!isFinite(val)) return 'Infinity';
            if (val >= 1000000)
            {
                val /= 1000;
                while (Math.round(val) >= 1000)
                {
                    val /= 1000;
                    base++;
                }
                if (base >= notations.length) { return 'Infinity'; } else { notationValue = notations[base]; }
            }
            return (Math.round(val * 1000) / 1000) + notationValue;
        };
    }

    function rawFormatter(val) { return Math.round(val * 1000) / 1000; }

    var formatLong = [' thousand', ' million', ' billion', ' trillion', ' quadrillion', ' quintillion', ' sextillion', ' septillion', ' octillion', ' nonillion'];
    var prefixes = ['', 'un', 'duo', 'tre', 'quattuor', 'quin', 'sex', 'septen', 'octo', 'novem'];
    var suffixes = ['decillion', 'vigintillion', 'trigintillion', 'quadragintillion', 'quinquagintillion', 'sexagintillion', 'septuagintillion', 'octogintillion', 'nonagintillion'];
    for (var i in suffixes)
    {
        for (var ii in prefixes)
        {
            formatLong.push(' ' + prefixes[ii] + suffixes[i]);
        }
    }

    var formatShort = ['k', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No'];
    var prefixes = ['', 'Un', 'Do', 'Tr', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No'];
    var suffixes = ['D', 'V', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'O', 'N'];
    for (var i in suffixes)
    {
        for (var ii in prefixes)
        {
            formatShort.push(' ' + prefixes[ii] + suffixes[i]);
        }
    }
    formatShort[10] = 'Dc';


    var numberFormatters =
        [
            formatEveryThirdPower(formatShort),
            formatEveryThirdPower(formatLong),
            rawFormatter
        ];
    // @ts-ignore
    globalThis["numberFormatters"] = numberFormatters;

    // @ts-ignore
    globalThis["Game"] = { prefs: { format: 1 } };
    globalThis["Beautify"] = function (val, floats)
    {
        var negative = (val < 0);
        var decimal = '';
        var fixed = val.toFixed(floats);
        // @ts-ignore
        if (floats > 0 && Math.abs(val) < 1000 && Math.floor(fixed) != fixed) decimal = '.' + (fixed.toString()).split('.')[1];
        val = Math.floor(Math.abs(val));
        // @ts-ignore
        if (floats > 0 && fixed == val + 1) val++;
        //var format=!EN?2:Game.prefs.format?2:1;
        var format = Game.prefs.format ? 2 : 1;
        var formatter = numberFormatters[format];
        var output = (val.toString().indexOf('e+') != -1 && format == 2) ? val.toPrecision(3).toString() : formatter(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        //var output=formatter(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g,',');
        if (output == '0') negative = false;
        return negative ? '-' + output : output + decimal;
    }
}

// Beautify parameters, expected result, json configuration.
type TestParameters = [[number, number?], string, string?];
/*
format: MenuKeys;
customFormatLocale: string;
customFormatOptions: string;
*/

function runTests()
{
    testSetup();

    const mod = new DisplayMod();
    mod["isRawFormat"] = () => true;

    const defaultOptions = "";
    //Some of these cases are slightly strange, but they do match cookie clicker logic.
    let normalTests = (): Array<TestParameters> => {
        return ([
            [[0], "0"],
            [[0.000001], "0"],
            [[1.9999999], "1"],
            [[1.99, 2], "1.99"],
            [[1.9999999, 2], "2"],
            [[1, 2], "1"],
            [[1.01, 2], "1.01"],
            [[1.015, 2], "1.01"],
            [[22.55], "22"],
            [[22.55, 2], "22.55"],
            [[-22.55, 2], "-22"],
            [[211111], "211,111"],
            [[-211111], "-211,111"],
            [[1234567890], "1,234,567,890"],
            [[91278387.182374], "91,278,387"],
            [[91278387.182374, 2], "91,278,387"],
            [[-91278387.182375], "-91,278,387"]
        ] satisfies [[number, number?], string][])
            .map((parameters) => [...parameters, defaultOptions]);
    };

    const tripleZeroConfig = `{"format": "triple-zero-x", "customFormatLocale": "", "customFormatOptions": {} }`;
    const newTripleZeroXTests = (): Array<TestParameters> =>  {
        return ([
            [[1222333444555666777888999000], "1.22233344[9×000]"],
            [[-1222333444555666777888999000], "-1.22233344[9×000]"],
            [[11222333444555666777888999000], "11.2223334[9×000]"],
            [[-11222333444555666777888999000], "-11.2223334[9×000]"],
            [[111222333444555666777888999000], "111.222333[9×000]"],
            [[-111222333444555666777888999000], "-111.222333[9×000]"],
            [[123459871397298163926786112313213.87127831267], "123.459871[10×000]"],
            [[-123459871397298163926786112313213.87127831267], "-123.459871[10×000]"],
            [[111222333444555666777888999000111222333], "111.222333[12×000]"],
            [[-111222333444555666777888999000111222333], "-111.222333[12×000]"],
        ] satisfies [[number, number?], string][])
            .map((parameters) => [...parameters, tripleZeroConfig]);
    };

    const customFormatConfig = `{"format": "custom", "customFormatLocale": "en-US", "customFormatOptions": { "maximumFractionDigits": 1, "notation": "engineering", "roundingMode": "trunc" } }`;
    const customFormatTests = (): Array<TestParameters> =>  {
        return ([
            [[1222333444555666777888999000], "1.2E27"],
            //[[-1222333444555666777888999000], "-1.3E27]"],
            [[11222333444555666777888999000], "11.2E27"],
            //[[-11222333444555666777888999000], "-11.2E27"],
            [[111222333444555666777888999000], "111.2E27"],
            //[[-111222333444555666777888999000], "-111.2E27"],
            [[123459871397298163926786112313213.87127831267], "123.5E30"], // Browser gives 123.4E30, respecting the round down. Not sure why node behaves this way specifically in 11-18.
            //[[-123459871397298163926786112313213.87127831267], "-123.5E30"],
            [[111222333444555666777888999000111222333], "111.2E36"],
            //[[-111222333444555666777888999000111222333], "-111.3E36"],
        ] satisfies [[number, number?], string][])
            .map((parameters) => [...parameters, customFormatConfig]);
    };


    let testCases = [
        ...normalTests(),
        ...newTripleZeroXTests(),
        ...customFormatTests()
    ];

    //mod["beautify"] = globalThis["Beautify"];

    // Debugger and step through.
    const debug = true;

    for (const testCase of testCases)
    {
        mod.load(testCase[2]);

        const calculated = mod.beautify(...testCase[0]);
        if (calculated !== testCase[1])
        {
            if (debug) {
                debugger;
                mod.load(testCase[2]);
                const debugcalc = mod.beautify(...testCase[0]);
            }
            console.error(
                "FAILED",
                "Actual",
                calculated,
                "Expected",
                testCase[1],
                "Test Case",
                testCase
            )
            throw new Error(`Actual: ${ calculated }, Expected: ${ testCase[1] }, Test Case: ${JSON.stringify(testCase)}`);
            //throw new Error("Tests failed");
        }
        console.log("Passed", testCase);
    }
}

runTests();