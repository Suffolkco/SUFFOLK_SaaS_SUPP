// /ASIUA:
// This is to add the unique ID to the custom list VIOLATION CHEAT SHEET
var showDebug = true;
try
{

	cheatSheet = loadASITable("VIOLATION CHEAT SHEET");
	var caseNo = getAppSpecific("Complaint Number");

	var i = 1;
	var newCheatsheet = new Array();
	for (var c in cheatSheet)
	{
		var itemNo = i++;
		var newRow = new Array();
		var vioNo = cheatSheet[c]["Reference Violation Number"];
		var withdrawVoidVio = cheatSheet[c]["Withdraw/Void Violation"];	  
		newRow["Violation Date"] = cheatSheet[c]["Violation Date"];
		newRow["Occurrence Date"] = cheatSheet[c]["Occurrence Date"];
		newRow["Case Number"] = caseNo;	
		newRow["Charge"] = cheatSheet[c]["Charge"];
		newRow["Create Violation"] = cheatSheet[c]["Create Violation"];
		newRow["Withdraw/Void Violation"] = withdrawVoidVio;
		newRow["Reference Violation Number"] = vioNo;
		newRow["Abbreviated Description"] = cheatSheet[c]["Abbreviated Description"];
		newRow["Item"] = itemNo.toString();
		logDebug("itemNo: " + itemNo);		
		logDebug("withdrawVoidVio: " + withdrawVoidVio);

		if (withdrawVoidVio != null)
		{
			if (vioNo != "" || vioNo != null)
			{
				logDebug("Withdraw violation request: " + vioNo);

				// get cap id from alt id
				var capIdRes = aa.cap.getCapID(vioNo);

				//GET CAP ID, if result returns an error then don't process this record.
				if (!capIdRes.getSuccess()) 
				{
					logDebugLocal("ERROR getting capId for record " + vioNo + ". Err: " + capIdRes.getOutput()); 
				}
				else
				{
					vioCapId = capIdRes.getOutput();
					var cap = aa.cap.getCap(vioCapId).getOutput();

					logDebug("Violation current status: " + getAppStatus(vioCapId));

					if (withdrawVoidVio  == 'Withdraw') // What do we do here? Unrelated or just set the Violation status to be withdraw?
					{
						if (!matches(getAppStatus(vioCapId), "Withdrawn"))
						{
							updateAppStatus("Withdrawn", "Updated through docket violation cheatsheet.", vioCapId);
						}
					}
					else if (withdrawVoidVio == "Void")
					{
						if (!matches(getAppStatus(vioCapId), "VOID"))
						{						
							updateAppStatus("VOID", "Updated through docket violation cheatsheet.", vioCapId);
						}
					}
				}
			
			}
			// 
		}


		newCheatsheet.push(newRow);		
	}
	removeASITable("VIOLATION CHEAT SHEET", capId);
	addASITable("VIOLATION CHEAT SHEET", newCheatsheet, capId);

}
catch (err) {
    var showDebug = false;
	logDebug("A JavaScript Error occured: " + err.message + " In Line " + err.lineNumber);
	}

