
/**
 * As of v2.052
 * This easily could get overriden (and CCSE does), so keeping a static reference even though it sucks.
 */
export const originalBeautify = function(val, floats)
{
	var negative=(val<0);
	var decimal='';
	var fixed=val.toFixed(floats);
	if (floats>0 && Math.abs(val)<1000 && Math.floor(fixed)!=fixed) decimal='.'+(fixed.toString()).split('.')[1];
	val=Math.floor(Math.abs(val));
	if (floats>0 && fixed==val+1) val++;
	//var format=!EN?2:Game.prefs.format?2:1;
	var format=Game.prefs.format?2:1;
	var formatter=numberFormatters[format];
	var output=(val.toString().indexOf('e+')!=-1 && format==2)?val.toPrecision(3).toString():formatter(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g,',');
	//var output=formatter(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g,',');
	if (output=='0') negative=false;
	return negative?'-'+output:output+decimal;
}

export const beautifyOverride = () => {
    if (!Game.customBeautify) 
    {
        Game.customBeautify = [];
    }
    
    //Mimick what CCSE is using for injection, but without the unnecessary calculations of the regular code path.
    //Because it evals the code in order to overload it, it shouldn't have any definitions outside of the global scope.
    globalThis.Beautify = function(val,floats)
    {
        let ret: string|undefined = undefined;
        for(var i in Game.customBeautify) 
        {
            ret = Game.customBeautify[i](val, floats, ret);
        }
        return ret;
    }
}
