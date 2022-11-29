// /ASIUB:
// This is to block saving if the custom field has not met the condition
var showDebug = false;
try
{
					    
	var lotProposed = AInfo["Total Number of Lots Proposed"];
	
	logDebug("lotProposed: " + lotProposed);     

	if (lotProposed && lotProposed != "" && lotProposed < 2)
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


