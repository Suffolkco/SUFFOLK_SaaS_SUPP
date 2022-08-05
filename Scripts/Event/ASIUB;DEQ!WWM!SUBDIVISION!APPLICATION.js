// /ASIUB:
// This is to blcok saving if the custom field has not met the condition
var showDebug = true;
try
{
					    
	var lotProposed = getAppSpecific("Total Number of Lots Proposed")
	
	logDebug("lotProposed: " + lotProposed);     

	if (lotProposed && lotProposed < 2)
	{
		cancel = true;
		showMessage = true;
		comment("Number of lots must be 2 or greater.");
	}
		
}
catch (err) {
    var showDebug = false;
	logDebug("A JavaScript Error occured: " + err.message + " In Line " + err.lineNumber);
	}


