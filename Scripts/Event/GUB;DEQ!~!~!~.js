var showDebug = true;
try
{
					    
	var fieldInspTime = AInfo["Field Inspection Time"];
	
	logDebug("fieldInspTime: " + fieldInspTime);     

	if (!matches(fieldInspTime, "", null, undefined))
	{
		if(!fieldInspTime.contains(':'))
		{
			cancel = true;
			showMessage = true;
			comment("Missing Colon in the field of Field Inspection Time.");
		}
	}

		
}
catch (err) {
    var showDebug = false;
	logDebug("A JavaScript Error occured: " + err.message + " In Line " + err.lineNumber);
	}


