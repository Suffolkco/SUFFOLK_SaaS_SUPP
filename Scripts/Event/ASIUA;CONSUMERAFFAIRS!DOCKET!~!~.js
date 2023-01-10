// /ASIUA:
// This is to add the unique ID to the custom list VIOLATION CHEAT SHEET
var showDebug = true;
try
{

	cheatSheet = loadASITable("VIOLATION CHEAT SHEET");
	
	var i = 1;
	var newCheatsheet = new Array();
	for (var c in cheatSheet)
	{
		var itemNo = i++;
		var newRow = new Array();
		newRow["Violation Date"] = cheatSheet[c]["Violation Date"];
		newRow["Occurrence Date"] = cheatSheet[c]["Occurrence Date"];
		newRow["Case Number"] = cheatSheet[c]["Case Number"];		
		newRow["Charge"] = cheatSheet[c]["Charge"];
		newRow["Create Violation"] = cheatSheet[c]["Create Violation"];
		newRow["Withdraw Violation"] = cheatSheet[c]["Withdraw Violation"];
		newRow["Reference Violation Number"] = cheatSheet[c]["Reference Violation Number"];
		newRow["Abbreviated Description"] = cheatSheet[c]["Abbreviated Description"];
		newRow["Item"] = itemNo.toString();
		logDebug("itemNo: " + itemNo);
		newCheatsheet.push(newRow);		
	}
	removeASITable("VIOLATION CHEAT SHEET", capId);
	addASITable("VIOLATION CHEAT SHEET", newCheatsheet, capId);

}
catch (err) {
    var showDebug = false;
	logDebug("A JavaScript Error occured: " + err.message + " In Line " + err.lineNumber);
	}

