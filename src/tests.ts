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

function runTests()
{
    testSetup();

    const mod = new DisplayMod();
    mod["isRawFormat"] = () => true;

    //Some of these cases are slightly strange, but they do match cookie clicker logic.
    let normalTests = (): Array<[string, string]> => [
        [mod.beautify(0), "0"],
        [mod.beautify(0.000001), "0"],
        [mod.beautify(1.9999999), "1"],
        [mod.beautify(1.99, 2), "1.99"],
        [mod.beautify(1.9999999, 2), "2"],
        [mod.beautify(1, 2), "1"],
        [mod.beautify(1.01, 2), "1.01"],
        [mod.beautify(1.015, 2), "1.01"],
        [mod.beautify(22.55), "22"],
        [mod.beautify(22.55, 2), "22.55"],
        [mod.beautify(-22.55, 2), "-22"],
        [mod.beautify(211111), "211,111"],
        [mod.beautify(-211111), "-211,111"],
        [mod.beautify(1234567890), "1,234,567,890"],
        [mod.beautify(91278387.182374), "91,278,387"],
        [mod.beautify(91278387.182374, 2), "91,278,387"],
        [mod.beautify(-91278387.182375), "-91,278,387"]
    ];

    const newFunctionalityTests = (): Array<[string, string]> =>  [
        [mod.beautify(1222333444555666777888999000), "1.22233[9×000]"],
        [mod.beautify(-1222333444555666777888999000), "-1.22233[9×000]"],
        [mod.beautify(11222333444555666777888999000), "11.2223[9×000]"],
        [mod.beautify(-11222333444555666777888999000), "-11.2223[9×000]"],
        [mod.beautify(111222333444555666777888999000), "111.222[9×000]"],
        [mod.beautify(-111222333444555666777888999000), "-111.222[9×000]"],
        [mod.beautify(123459871397298163926786112313213.87127831267), "123.460[10×000]"],
        [mod.beautify(-123459871397298163926786112313213.87127831267), "-123.460[10×000]"],
        [mod.beautify(111222333444555666777888999000111222333), "111.222[12×000]"],
        [mod.beautify(-111222333444555666777888999000111222333), "-111.222[12×000]"],
    ];

    let testCases = [
        ...normalTests(),
        ...newFunctionalityTests()
    ];

    mod["beautify"] = globalThis["Beautify"];

    testCases = [
        ...testCases,
        ...normalTests()
    ]

    for (const testCase of testCases)
    {
        if (testCase[0] !== testCase[1])
        {
            throw new Error(`Actual: ${ testCase[0] }, Expected: ${ testCase[1] }`);
        }
        console.log("Passed", testCase);
    }
}



runTests();