// /ASIUA:
// This is to add the unique ID to the custom list VIOLATION CHEAT SHEET
var showDebug = true;
try
{
	var AInfo = new Array();						// Create array for tokenized variables

	//loadASITables4ACA();

	local_loadASITables4ACA();
	
	//logGlobals(AInfo);

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

	function local_loadASITables4ACA() {
		// Loads App Specific tables into their own array of arrays.  Creates global array objects
		// Optional parameter, cap ID to load from.  If no CAP Id specified, use the capModel
		var itemCap = capId;
		if (1 == arguments.length) {
			itemCap = arguments[0];
			var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput()
		} else {
			var gm = cap.getAppSpecificTableGroupModel();   
		}
		for (var ta = gm.getTablesMap(), tai = ta.values().iterator(); tai.hasNext();) {
			var tsm = tai.next();
			if (!tsm.rowIndex.isEmpty()) {
				var tempObject = new Array,
				tempArray = new Array,
				tn = tsm.getTableName();
				tn = String(tn).replace(/[^a-zA-Z0-9]+/g, ""),
				isNaN(tn.substring(0, 1)) || (tn = "TBL" + tn);
				for (var tsmfldi = tsm.getTableField().iterator(), tsmcoli = tsm.getColumns().iterator(), numrows = 1; tsmfldi.hasNext();) {
					if (!tsmcoli.hasNext()) {
						var tsmcoli = tsm.getColumns().iterator();
						tempArray.push(tempObject);
						var tempObject = new Array;
						numrows++
					}
					var tcol = tsmcoli.next();
					var tobj = tsmfldi.next(); 
					var tval = ""; 
					try { 
						if(!tobj || !tobj.getInputValue()){
							tval = tobj;
						} else {
							tval = tobj.getInputValue(); 
						}
					}  catch (ex) { 
						tval = tobj; 
					}
					logDebug("tcol: " + tcol + ", tval: " + tval);
					tempObject[tcol.getColumnName()] = tval;
				}
				tempArray.push(tempObject);
				var copyStr = "" + tn + " = tempArray";
				logDebug("ASI Table Array : " + tn + " (" + numrows + " Rows)"),
				eval(copyStr)
			}
		}
	}