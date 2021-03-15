//ASA:DEQ/OPC/HAZARDOUS MATERIAL TANK/RENEWAL

showDebug = false;
var siteFeeEx = false; 
var addChild = aa.cap.createRenewalCap(parentCapId, capId, true);
var parentID = getParentCapID4Renewal();
logDebug("Parent Id is: " + parentID);
logDebug("capId is: " + capId);
var conArray = getContactArray(capId);
var feeExemptASI = getAppSpecific("Fee Exempt");
var ownTypeCod = getAppSpecific("Owner Type Code", parentID);
var petCode = getAppSpecific("Type of Petroleum Facility Code", parentID);

//Without this check in place, ASA is running twice.  Once when the renewal is first generated and again when the application has been submitted
if (conArray.length < 1)
{
	aa.cap.updateAccessByACA(capId, "N");
	copyContacts(parentCapId, capId);
	//copyASIFields(parentCapId, capId);
	//copyASITables(parentCapId, capId);
	copyAddresses(parentCapId, capId);
	copyOwner(parentCapId, capId);
	copyParcels(parentCapId, capId);
	copyParcelGisObjects();
	var childTankArray = getChildren("DEQ/OPC/Hazardous Tank/Permit", parentID);
	if (childTankArray != null)
	{
		for (var i = 0; i < childTankArray.length; i++)
		{
			var childCapId = childTankArray[i].getCustomID();
			logDebug("capId is: " + childCapId);
			var getCapResult = aa.cap.getCapID(childCapId);
			if (getCapResult.getSuccess())
			{
				var childCap = getCapResult.getOutput();
				var cCapModel = aa.cap.getCap(childCap).getOutput().getCapModel();
				var cStatus = cCapModel.getCapStatus();
				var offUse = getAppSpecific("Official Use Code", childTankArray[i]);
				logDebug("Child status is: " + cStatus);

				if (cStatus == "Active" && !matches(offUse, "UR", "UA", "81", "82", "85", null) && !offUse.contains("EX"))				
				{
					var rowArray = [];
					var scdhsFromApp = getAppSpecific("SCDHS Tank #", childTankArray[i]);
					var capFromApp = getAppSpecific("Capacity", childTankArray[i]);
					var uniFromApp = getAppSpecific("Units Label", childTankArray[i]);
					var proStorFromApp = getAppSpecific("Product Stored Label", childTankArray[i]);
					var tankLoFromApp = getAppSpecific("Tank Location Label", childTankArray[i]);
					var othProStorFromApp = getAppSpecific("Other Product Stored", childTankArray[i]);

					rowArray["SCDHS Tank #"] = scdhsFromApp;
					rowArray["Capacity"] = capFromApp;
					rowArray["Tank Location Label"] = tankLoFromApp;
					rowArray["Units"] = uniFromApp;
					rowArray["Product Stored Label"] = proStorFromApp;
					rowArray["Other Product Stored"] = othProStorFromApp;
					
					addRowToASITable("TANK INFORMATION", rowArray, capId);                 
				}    
			}
		}
	}	
}
else
{
	if (ownTypeCod == null || ownTypeCod == "2" || ownTypeCod == "4" || (ownTypeCod == "3" && petCode != "8"))
	{
		logDebug("This permit is fee exempt");
		editAppSpecific("Fee Exempt", "Yes", capId);
		siteFeeEx = true;
	}
	else
	{
		var ownTypeLab = getAppSpecific("Owner Type Label", parentID);
		logDebug("Owner type is Label is: " + ownTypeLab);
		var epaReg = getAppSpecific("EPA", parentID);
		logDebug("EPA is: " + epaReg);
		var pbsReg = getAppSpecific("PBS", parentID);
		logDebug("PBS is: " + pbsReg);
		var permYears = 0;
		var totalCap = 0;

		if ((epaReg != null && epaReg == "Yes") || (pbsReg != null && pbsReg == "Yes"))
		{
			permYears = 3;
		}
		if ((epaReg == "No" || epaReg == null) && (pbsReg == "No" || pbsReg == null))
		{
			permYears = 5;
		}

		var tankArray = getChildren("DEQ/OPC/Hazardous Tank/Permit", parentID);
		logDebug("My tank array is: " + tankArray);

		for (t in tankArray)
		{
			var tankCapacity = parseInt(getAppSpecific("Capacity", tankArray[t]));
			var feeEx = getAppSpecific("Fee Exempt", tankArray[t]);
			var offUse = getAppSpecific("Official Use Code", tankArray[t]);
			var tankStat = getTankAppStatus(tankArray[t]);
			logDebug("Capacity for " + tankArray[t] + " is " + tankCapacity + " and the app status is: " + tankStat);
			if ((feeEx == null || feeEx == "No") && tankStat == "Active" && !matches(offUse, "UR", "UA", "81", "82", "85", null) && !offUse.contains("EX"))
			{
				totalCap += tankCapacity;
			}
		}
		logDebug("total capacity is: " + totalCap);

		if (totalCap > 0 && !siteFeeEx)
		{
			if (totalCap <= 1000)
			{
				updateFee("PERMOP-001", "DEQ_OPCSITE", "FINAL", (39.82 * permYears), "Y");
			}
			else if (totalCap > 1000 && totalCap <= 10000)
			{
				updateFee("PERMOP-001", "DEQ_OPCSITE", "FINAL", (36.30 + (0.00352 * parseInt(totalCap))) * permYears, "Y");
			}
			else if (totalCap > 10000 && totalCap <= 100000)
			{
				updateFee("PERMOP-001", "DEQ_OPCSITE", "FINAL", (45.10 + (0.00264 * parseInt(totalCap))) * permYears, "Y");
			}
			else if (totalCap > 100000 && totalCap <= 1000000)
			{
				updateFee("PERMOP-001", "DEQ_OPCSITE", "FINAL", (133.10 + (0.00176 * parseInt(totalCap))) * permYears, "Y");
			}
			else if (totalCap > 1000000 && totalCap <= 10000000)
			{
				updateFee("PERMOP-001", "DEQ_OPCSITE", "FINAL", (1717.10 + (0.000176 * parseInt(totalCap))) * permYears, "Y");
			}
			else if (totalCap > 10000000 && totalCap <= 100000000)
			{
				updateFee("PERMOP-001", "DEQ_OPCSITE", "FINAL", (3301.10 + (0.0000176 * parseInt(totalCap))) * permYears, "Y");
			}
			else if (totalCap > 100000000)
			{
				updateFee("PERMOP-001", "DEQ_OPCSITE", "FINAL", (4885.10 + (0.00000176 * parseInt(totalCap))) * permYears, "Y");
			}
		}
	}
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
	var tssmResult = aa.appSpecificTableScript.getAppSpecificTableModel(itemCap,tableName);
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
		if (typeof(tableValues[colname.getColumnName()].fieldValue) != "undefined")
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
	if (!addResult .getSuccess())
	{ 
		logDebug("**WARNING: error adding record to ASI Table:  " + tableName + " " + addResult.getErrorMessage()); 
		return false;
	}
	else
	{
		logDebug("Successfully added record to ASI Table: " + tableName);
	}
}

function matches(eVal, argList) {
	for (var i = 1; i < arguments.length; i++) {
		if (arguments[i] == eVal) {
			return true;
		}
	}
	return false;
} 