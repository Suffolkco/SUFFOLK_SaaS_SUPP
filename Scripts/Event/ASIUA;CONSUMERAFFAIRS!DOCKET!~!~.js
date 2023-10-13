// /ASIUA:
// This is to add the unique ID to the custom list VIOLATION CHEAT SHEET
var showDebug = true;
try
{
	// Update altid enforcement type
	var enfType = getAppSpecific("Enforcement Type");      
    logDebug("enftype is: " + enfType);
    var altIdString = String(capId.getCustomID());
	
	if (!altIdString.endsWith("Enforcement Patrol") && !altIdString.endsWith("Internal Enforcement") 
	&& !altIdString.endsWith("External Enforcement"))
	{	
        altIdNewString = altIdString + " " + enfType;
        logDebug("Updating Alt ID to: " + altIdNewString);           
		aa.cap.updateCapAltID(capId, altIdNewString);
    }

	
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
		newRow["Law"] = cheatSheet[c]["Law"];
		newRow["Description"] = cheatSheet[c]["Description"];
		newRow["Create Violation"] = cheatSheet[c]["Create Violation"];
		newRow["Withdraw/Void Violation"] = withdrawVoidVio;
		newRow["Reference Violation Number"] = vioNo;		
		newRow["Abbreviated Description"] = cheatSheet[c]["Abbreviated Description"];
		newRow["Max Penalty"] = cheatSheet[c]["Max Penalty"];
		newRow["Reduced Penalty"] = cheatSheet[c]["Reduced Penalty"];
		newRow["Item"] = itemNo.toString();
		logDebug("itemNo: " + itemNo);		
		logDebug("withdrawVoidVio: " + withdrawVoidVio);

		var vioDate = cheatSheet[c]["Violation Date"];
		var law = cheatSheet[c]["Law"];		              
		var desc = cheatSheet[c]["Description"];
		var abbDesc =cheatSheet[c]["Abbreviated Description"];
		var maxPenalty = cheatSheet[c]["Max Penalty"];
		var reducedPenalty = cheatSheet[c]["Reduced Penalty"];
	
		
		logDebug("vioNo: " + vioNo);

			if (vioNo != "" || vioNo != null)
			{				
				// get cap id from alt id
				var capIdRes = aa.cap.getCapID(vioNo);

				//GET CAP ID, if result returns an error then don't process this record.
				if (!capIdRes.getSuccess()) 
				{
					logDebug("ERROR getting capId for record " + vioNo + ". Err: " + capIdRes.getOutput()); 
				}
				else
				{
					vioCapId = capIdRes.getOutput();
					

					if (withdrawVoidVio != null)
					{			
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
						else if (withdrawVoidVio == "Dismissed")
						{
							if (!matches(getAppStatus(vioCapId), "Dismissed"))
							{						
								updateAppStatus("Dismissed", "Updated through docket violation cheatsheet.", vioCapId);
							}
						}							
						
					}
					if (vioCapId != null)
					{		
						logDebug("Violation date: " + vioDate);
						editAppSpecific("Date of Violation", vioDate, vioCapId);     							
											
						// Update Violation ASI list 		
						// Delete existing violation potential violation table
						//var tableArr = loadASITable("POTENTIAL VIOLATION", vioCapId);
						var tssmResult = aa.appSpecificTableScript.removeAppSpecificTableInfos("POTENTIAL VIOLATION",vioCapId,"ADMIN");
						logDebug("tssmResult :" + tssmResult.getOutput());
						logDebug("Add Row to : " + vioCapId);   
						logDebug("Law: " + law);              
			
						var newVioResultsTable = new Array();				
						var newRow = new Array();
						newRow["Law"] = law;
						newRow["Violation Description"] = desc;
						newRow["Abbreviated Description"] = abbDesc;
						newRow["Max Penalty"] = maxPenalty;
						newRow["Reduced Penalty"] = reducedPenalty;								
						newVioResultsTable.push(newRow);			
						logDebug("Add Row to : " + vioCapId);       			
						addRowToASITable("POTENTIAL VIOLATION", newRow, vioCapId);


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


function addRowToASITable(tableName, tableValues) //optional capId
{
    //tableName is the name of the ASI table
    //tableValues is an associative array of values.  All elements must be either a string or asiTableVal object
    itemCap = capId
    if (arguments.length > 2)
    {
        itemCap = arguments[2]; //use capId specified in args
    }
    var tssmResult = aa.appSpecificTableScript.getAppSpecificTableModel(itemCap, tableName);
    if (!tssmResult.getSuccess())
    {
        logDebug("**WARNING: error retrieving app specific table " + tableName + " " + tssmResult.getErrorMessage());
        return false;
    }
    var tssm = tssmResult.getOutput();
    var tsm = tssm.getAppSpecificTableModel();
    var fld = tsm.getTableField();
    var col = tsm.getColumns();
    var fld_readonly = tsm.getReadonlyField(); //get ReadOnly property
    var coli = col.iterator();
    while (coli.hasNext())
    {
        colname = coli.next();
        if (!tableValues[colname.getColumnName()]) 
        {
            logDebug("Value in " + colname.getColumnName() + " - " + tableValues[colname.getColumnName()]);
            logDebug("addToASITable: null or undefined value supplied for column " + colname.getColumnName() + ", setting to empty string");
            tableValues[colname.getColumnName()] = "";
        }
        if (typeof (tableValues[colname.getColumnName()].fieldValue) != "undefined")
        {
            fld.add(tableValues[colname.getColumnName()].fieldValue);
            fld_readonly.add(tableValues[colname.getColumnName()].readOnly);
        }
        else // we are passed a string
        {
            fld.add(tableValues[colname.getColumnName()]);
            fld_readonly.add(null);
        }
    }
    tsm.setTableField(fld);
    tsm.setReadonlyField(fld_readonly); // set readonly field
    addResult = aa.appSpecificTableScript.editAppSpecificTableInfos(tsm, itemCap, currentUserID);
    if (!addResult.getSuccess())
    {
        logDebug("**WARNING: error adding record to ASI Table:  " + tableName + " " + addResult.getErrorMessage());
        return false;
    }
    else
    {
        logDebug("Successfully added record to ASI Table: " + tableName);
    }
}