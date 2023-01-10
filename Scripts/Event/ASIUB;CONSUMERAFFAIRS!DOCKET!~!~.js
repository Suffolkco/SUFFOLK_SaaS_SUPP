// /ASIUA:
// This is to add the unique ID to the custom list VIOLATION CHEAT SHEET
var showDebug = true;
try
{

	cheatSheet = loadASITable("VIOLATION CHEAT SHEET");
	
		
	for (var c in cheatSheet)
	{
	
		var createVio = cheatSheet[c]["Create Violation"];
		var withdrawVio = cheatSheet[c]["Withdraw Violation"];
		logDebug("createVio:" + createVio);
		logDebug("withdrawVio:" + withdrawVio);
 
		// Only if they enable the flag and the field is empty
		if (createVio == 'CHECKED' && withdrawVio =='CHECKED')
		{
			cancel = true;
			showMessage = true;
			comment("Please confirm the entries. 'Create Violation' and 'Withdraw Violation' checkboxes cannot be enabled at the same time.");
		}
	}


}
catch (err) {
    var showDebug = false;
	logDebug("A JavaScript Error occured: " + err.message + " In Line " + err.lineNumber);
	}

