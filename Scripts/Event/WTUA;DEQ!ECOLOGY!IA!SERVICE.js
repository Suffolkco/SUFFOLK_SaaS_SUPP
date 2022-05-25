if (currentUserID == "RLITTLEFIELD")
{
	showDebug = true;
}
var parentId = getParent();
var daysAdd;
useAppSpecificGroupName = true;
var sampleDates = [];

var conUpdate = getAppSpecific("SERVICE PERFORMED.Contract Update", capId);
var serviceReport = getAppSpecific("SERVICE PERFORMED.Service Report", capId);
var sampleResults = getAppSpecific("SERVICE PERFORMED.Sample Results", capId);
var parConExp = getAppSpecific("CONTRACT INFORMATION.Contract Expiration Date", parentId);
var conStartServ = getAppSpecific("CONTRACT INFORMATION.Contract Start Date", capId);
var contermServ = getAppSpecific("CONTRACT INFORMATION.Contract Term", capId);
var myCap = capId;
var contractAnualCost = getAppSpecific("CONTRACT INFORMATION.Contract Annual Cost", capId);
var myCustomCap = myCap.getCustomID();
var use = getAppSpecific("SYSTEM ACTIVITY.Use", capId);
var serviceDate = new Date(AInfo["Service Date"]);
var maxDate;
var labResultFieldDataTable = loadASITable("LAB RESULTS AND FIELD DATA");
for (var p in labResultFieldDataTable)
{
	var sampleDate = new Date(labResultFieldDataTable[p]["Sample Collection Date"]);
	logDebug("date is: " + sampleDate);
	sampleDates.push(sampleDate);
	var collectionDate = labResultFieldDataTable[p]["Sample Collection Date"];
}
if (sampleDates)
{
	logDebug("sampledates is: " + sampleDates);
	maxDate = Math.max.apply(null, sampleDates);
	maxDate = new Date(maxDate);
	maxDate = (maxDate.getMonth() + 1) + "/" + maxDate.getDate() + "/" + maxDate.getFullYear()
	logDebug("maxdate is: " + maxDate);
}
var phase = getAppSpecific("SCHEDULING INFORMATION.Phase", capId);
var process = getAppSpecific("SCHEDULING INFORMATION.Process", capId);
var collection = getAppSpecific("SCHEDULING INFORMATION.Collection", capId);
var collector = getAppSpecific("SCHEDULING INFORMATION.Collector", capId);
var fieldId = getAppSpecific("SCHEDULING INFORMATION.Field ID", capId);
var lab = getAppSpecific("SCHEDULING INFORMATION.Lab", capId);

logDebugLocal("Actual parent ID: " + parentId);
logDebugLocal("wfTask: " + wfTask);
logDebugLocal("wfStatus: " + wfStatus);

//here
var tableForParent = loadASITable("LAB RESULTS AND FIELD DATA", capId);
var labResultsTable = new Array();
for (var l in tableForParent)
{
	var newRow = new Array();
	newRow["Sample Date"] = tableForParent[l]["Sample Collection Date"];
	newRow["Lab ID"] = tableForParent[l]["Lab ID"];
	newRow["Source"] = myCustomCap;
	newRow["TN"] = tableForParent[l]["TN"];
	newRow["NO3 Nitrate"] = tableForParent[l]["NO3 Nitrate"];
	newRow["NO2 Nitrite"] = tableForParent[l]["NO2 Nitrite"];
	newRow["TKN"] = tableForParent[l]["TKN"];
	newRow["NH4 Ammonia"] = tableForParent[l]["NH4 Ammonia"];
	newRow["BOD"] = tableForParent[l]["BOD"];
	newRow["TSS"] = tableForParent[l]["TSS"];
	newRow["ALK"] = tableForParent[l]["ALK"];
	newRow["DO"] = tableForParent[l]["DO"];
	newRow["PH"] = tableForParent[l]["PH"];
	newRow["WW Temp"] = tableForParent[l]["WW Temp"];
	newRow["Air Temp"] = tableForParent[l]["Air Temp"];
	newRow["Process"] = tableForParent[l]["Process"];
	newRow["Collection"] = tableForParent[l]["Collection"];
	newRow["Lab"] = tableForParent[l]["Lab"];
	newRow["Comment"] = tableForParent[l]["Comment"]
	newRow["Status"] = wfStatus;
	newRow["Sample Date"] = collectionDate;
	newRow["Phase"] = phase;
	// newRow["Process"] = process;
	// newRow["Collection"] = collection;
	newRow["Collector"] = collector;
	newRow["Field ID"] = fieldId;
	newRow["Lab"] = lab;

	labResultsTable.push(newRow);
	break;
}

addASITable("LAB RESULTS", labResultsTable, parentId);
editAppSpecificLOCAL("PROPERTY INFORMATION.Use", use, parentId);

if (wfTask == "Review form and check that documents are correct" && wfStatus == "Complete")
{

	var capContacts = aa.people.getCapContactByCapID(parentCapId);
	if (capContacts.getSuccess())
	{
		capContacts = capContacts.getOutput();
		logDebug("capContacts: " + capContacts);

		for (var yy in capContacts)
		{
			//aa.people.removeCapContact(parentCapId, capContacts[yy].getPeople().getContactSeqNumber());

			if (capContacts[yy].getPeople().getAuditStatus() == "A")
			{
				capContacts[yy].getPeople().setAuditStatus("I");
				aa.people.editCapContact(capContacts[yy].getCapContactModel());
				logDebug("Contact Status: " + capContacts[yy].getPeople().getAuditStatus());
				logDebug("We Got in here");
			}
		}

	}

	copyContacts(capId, parentCapId);
	if (conUpdate == "CHECKED")
	{
		logDebugLocal("conupdate is good");
		var contractDate = new Date(conStartServ);

		var datePlusCon = (contractDate.getMonth() + 1) + "/" + contractDate.getDate() + "/" + contractDate.getFullYear();

		if (conStartServ != 'null')
		{
			editAppSpecificLOCAL("CONTRACT INFORMATION.Contract Start Date", conStartServ, parentId);
			editAppSpecificLOCAL("CONTRACT INFORMATION.Contract Term", contermServ, parentId);
			datePlusCon = (contractDate.getMonth() + 1) + "/" + contractDate.getDate() + "/" + (contractDate.getFullYear() + Number(contermServ));
			editAppSpecificLOCAL("CONTRACT INFORMATION.Contract Expiration Date", datePlusCon, parentId);
		}
		updateShortNotes("Contract Expiration: " + datePlusCon);
		logDebugLocal("contract annual cost is: " + contractAnualCost);

		if (contractAnualCost != null)
		{
			editAppSpecificLOCAL("CONTRACT INFORMATION.Contract Annual Cost", contractAnualCost, parentId);
		}

		/* logDebug("conStartServ is: " + datePlusCon);
		 //aa.print("datePlusCon is: " + datePlusCon);
		 logDebug("Contract Expiration Date: " + datePlusCon);
		 editAppSpecificLOCAL("Contract Expiration Date", datePlusCon, parentId);
						 
		 logDebug("Remove old one at parent id"); 
		 copyLicenseProfessionalForLic(capId, parentId); 
		 logDebug("Add new in parent");
		 removeUnmatchedProfessionals(capId, parentId);
		 logDebug("Copied done?");*/

	}
	// Service Date
	if (serviceReport == "CHECKED" || serviceReport == "YES")
	{
		var nextServiceDate = new Date(getAppSpecific("SERVICE INFORMATION.Service Date"));
		nextServiceDate = (nextServiceDate.getMonth() + 1) + "/" + (nextServiceDate.getDate()) + "/" + (nextServiceDate.getFullYear() + 1);
		logDebugLocal("Next Service Date: " + nextServiceDate);
		editAppSpecificLOCAL("CONTRACT INFORMATION.Next Service Date", nextServiceDate, capId);
		editAppSpecificLOCAL("SERVICE INFORMATION.Next Service Date", nextServiceDate, capId);
		editAppSpecificLOCAL("CONTRACT INFORMATION.Next Service Date", nextServiceDate, parentId);
	}
	// Sample Collection Date
	if (sampleResults == "CHECKED")
	{
		var nextSampleDate = (sampleDate.getMonth() + 1) + "/" + sampleDate.getDate() + "/" + (sampleDate.getFullYear() + 3);
		logDebugLocal("Next Sample Date: " + nextSampleDate);
		editAppSpecificLOCAL("CONTRACT INFORMATION.Next Sample Date", maxDate, parentId);
	}

}

function addDays(date, days) {
	var result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}

function copyLicenseProfessionalForLic(srcCapId, targetCapId) {

	logDebug("copyLicenseProfessionalForLic. ");

	//1. Get license professionals with source CAPID.
	var capLicenses = getLicenseProfessionalForLic(srcCapId);
	if (capLicenses == null || capLicenses.length == 0)
	{
		return;
	}
	//2. Get license professionals with target CAPID.
	var targetLicenses = getLicenseProfessionalForLic(targetCapId);
	//3. Check to see which licProf is matched in both source and target.
	for (loopk in capLicenses)
	{
		sourcelicProfModel = capLicenses[loopk];
		//3.1 Set target CAPID to source lic prof.
		sourcelicProfModel.setCapID(targetCapId);
		targetLicProfModel = null;

		//3.2 Check to see if sourceLicProf exist.
		if (targetLicenses != null && targetLicenses.length > 0)
		{
			for (loop2 in targetLicenses)
			{

				if (targetLicenses[loop2].getLicenseType() == "IA Service Provider")
				{
					logDebug("Target License Type is valid:" + targetLicenses[loop2].getLicenseType());
					if (isMatchLicenseProfessional(sourcelicProfModel, targetLicenses[loop2]))
					{

						logDebug("Source and target matched:" + sourcelicProfModel.getLicenseType());
						targetLicProfModel = targetLicenses[loop2];
						break;
					}
				}

			}
		}
		//3.3 It is a matched licProf model.
		if (targetLicProfModel != null)
		{
			//3.3.1 Copy information from source to target.
			logDebug("Copy LP from child to parent:" + targetLicProfModel.getLicenseType());
			aa.licenseProfessional.copyLicenseProfessionalScriptModel(sourcelicProfModel, targetLicProfModel);
			//3.3.2 Edit licProf with source licProf information. 
			aa.licenseProfessional.editLicensedProfessional(targetLicProfModel);
		}
		//3.4 It is new licProf model.
		else
		{
			logDebug("Need to add new LP:" + sourcelicProfModel.getLicenseType());
			//3.4.1 Create new license professional.
			if (sourcelicProfModel.getLicenseType() == "IA Service Provider")
			{
				logDebug("New LP added:" + sourcelicProfModel.getLicenseType());
				aa.licenseProfessional.createLicensedProfessional(sourcelicProfModel);
			}
		}
	}
}
function removeUnmatchedProfessionals(srcCapId, targetCapId) {
	var matched;
	var targetLicenses = getLicenseProfessionalForLic(targetCapId);
	var capLicenses = getLicenseProfessionalForLic(srcCapId);
	if (targetLicenses == null || targetLicenses.length == 0 || capLicenses == null || capLicenses.length == 0)
	{
		return;
	}
	// Check to see which licProf is matched in both source and target.
	// IA parent record
	for (loop2 in targetLicenses)
	{
		matched = false;
		// IA Service record			
		for (loopk in capLicenses)
		{
			sourcelicProfModel = capLicenses[loopk];
			//3.1 Set target CAPID to source lic prof.
			sourcelicProfModel.setCapID(targetCapId);

			if (isMatchLicenseProfessional(sourcelicProfModel, targetLicenses[loop2]))
			{
				targetLicProfModel = targetLicenses[loop2];
				matched = true;
				break;
			}
			targetLicProfModel = targetLicenses[loop2];

		}
		logDebug("Matched? ") + matched;

		//3.3 It is a matched licProf model.
		if (matched)
		{

			logDebug("Matched: " + targetLicProfModel.getLicenseType());
		}
		else
		{

			if (targetLicProfModel.getLicenseType() == "IA Service Provider")
			{
				logDebug("To delete parent License Type:" + targetLicProfModel.getLicenseType());
				logDebug("getPrintFlag():" + targetLicProfModel.getPrintFlag());
				// Check LP Primary Flag is set
				if (targetLicProfModel.getPrintFlag() == "Y") 
				{
					// Set to not primary before deleting				
					targetLicProfModel.setPrintFlag("N");
					logDebug("Set print flag:" + targetLicProfModel.getPrintFlag());
					aa.licenseProfessional.editLicensedProfessional(targetLicProfModel);
				}

				aa.licenseProfessional.removeLicensedProfessional(targetLicProfModel);
			}
			else
			{
				logDebug("Not the corresponding LP Type:" + targetLicProfModel.getLicenseType());
			}
		}
	}
}

function removeAllProfessionals(targetCapId) {
	var targetLicenses = getLicenseProfessionalForLic(targetCapId);
	if (targetLicenses != null && targetLicenses.length > 0)
	{
		for (loop2 in targetLicenses)
		{
			logDebug("Removing License Type:" + targetLicenses[loop2].getLicenseType());
			aa.licenseProfessional.removeLicensedProfessional(targetLicenses[loop2]);
		}
	}
}

function copyAllProfessionals(srcCapId, targetCapId) {
	//1. Get license professionals with source CAPID.
	var capLicenses = getLicenseProfessionalForLic(srcCapId);
	if (capLicenses == null || capLicenses.length == 0)
	{
		return;
	}
	//2. Get license professionals with target CAPID.
	var targetLicenses = getLicenseProfessionalForLic(targetCapId);
	//3. Check to see which licProf is matched in both source and target.
	for (loopk in capLicenses)
	{
		sourcelicProfModel = capLicenses[loopk];
		//3.1 Set target CAPID to source lic prof.
		sourcelicProfModel.setCapID(targetCapId);
		//3.4.1 Create new license professional.			
		logDebug("Creating new LP in parent record:" + sourcelicProfModel.getLicenseType());
		aa.licenseProfessional.createLicensedProfessional(sourcelicProfModel);
	}
}


function setPrimaryLicProf(capId) {

	try
	{

		var profArr = getLicenseProfessional(capId);

		comment("Prof Arr is " + profArr);

		var primaryMsg = "";

		if ((profArr != null) && (profArr.length = 1)) 
		{

			comment("Array populated");

			for (var x in profArr) 
			{

				comment("Primary Status is " + profArr[x].getPrintFlag());

				if (profArr[x].getPrintFlag() == "N") 
				{

					profArr[x].setPrintFlag("Y");

					aa.licenseProfessional.editLicensedProfessional(profArr[x]);

					primaryMsg = "Contractor set to Primary.";

				}

			}

			return primaryMsg;

			comment("Action: " + primaryMsg);

		}

		else

			comment("Problem with contractor");

	} catch (err)
	{

		logDebug("An error occurred in custom function setPrimaryLicProf Conversion: " + err.message);

		logDebug(err.stack);

	}
}


function removeLicenseProfessionalForLic(srcCapId, targetCapId) {
	//1. Get license professionals with source CAPID.
	var capLicenses = getLicenseProfessionalForLic(srcCapId);
	if (capLicenses == null || capLicenses.length == 0)
	{
		return;
	}

	//2. Get license professionals with target CAPID.
	var targetLicenses = getLicenseProfessionalForLic(targetCapId);

	//3. Check to see which licProf is matched in both source and target.
	for (loopk in capLicenses)
	{
		sourcelicProfModel = capLicenses[loopk];
		//3.1 Set target CAPID to source lic prof.
		sourcelicProfModel.setCapID(targetCapId);
		targetLicProfModel = null;
		logDebug("Parent License Type:" + sourcelicProfModel.getLicenseType());
		logDebug("Parent Primary Flag:" + sourcelicProfModel.getTypeFlag());
		debugObject(sourcelicProfModel);
		//3.2 Check to see if sourceLicProf exist.
		if (targetLicenses != null && targetLicenses.length > 0)
		{
			for (loop2 in targetLicenses)
			{
				logDebug("License Type:" + targetLicenses[loop2].getLicenseType());
				debugObject(targetLicenses[loop2]);
				if (!isMatchLicenseProfessional(sourcelicProfModel, targetLicenses[loop2]))
				{
					logDebug("Not match Parent License Type:" + targetLicenses[loop2].getLicenseType());
					logDebug("Not match Child License Type:" + sourcelicProfModel.getLicenseType());
					break;
				}
			}
		}
		logDebug("Target License Count:" + targetLicenses.length);
		//Not match licProf model and only if there are more than 1 LP. We don't want to delete the new one that was added.
		if (targetLicProfModel == null && targetLicenses.length != 1) 
		{
			logDebug("To delete parent License Type:" + targetLicenses[loop2].getLicenseType());
			logDebug("getPrintFlag():" + targetLicenses[loop2].getPrintFlag());
			// Check LP Primary Flag is set
			if (targetLicenses[loop2].getPrintFlag() == "Y") 
			{
				// Set to not primary before deleting				
				targetLicenses[loop2].setPrintFlag("N");
				logDebug("Set print flag:" + targetLicenses[loop2].getPrintFlag());
				aa.licenseProfessional.editLicensedProfessional(targetLicenses[loop2]);
			}

			aa.licenseProfessional.removeLicensedProfessional(targetLicenses[loop2]);
		}
	}
}

function debugObject(object) {
	var output = '';
	for (property in object)
	{
		output += "<font color=red>" + property + "</font>" + ': ' + "<bold>" + object[property] + "</bold>" + '; ' + "<BR>";
	}
	logDebug(output);
}
function editAppSpecificLOCAL(itemName, itemValue)  // optional: itemCap
{
	var updated = false;
	var i = 0;
	itemCap = capId;
	if (arguments.length == 3) itemCap = arguments[2]; // use cap ID specified in args
	if (useAppSpecificGroupName)
	{
		if (itemName.indexOf(".") < 0)
		{logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true"); return false}
		var itemGroup = itemName.substr(0, itemName.indexOf("."));
		var itemName = itemName.substr(itemName.indexOf(".") + 1);
	}
	var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
	if (appSpecInfoResult.getSuccess())
	{
		var appspecObj = appSpecInfoResult.getOutput();
		if (itemName != "")
		{
			while (i < appspecObj.length && !updated)
			{
				if (appspecObj[i].getCheckboxDesc() == itemName && (!useAppSpecificGroupName || appspecObj[i].getCheckboxType() == itemGroup))
				{
					appspecObj[i].setChecklistComment(itemValue);
					var actionResult = aa.appSpecificInfo.editAppSpecInfos(appspecObj);
					if (actionResult.getSuccess()) 
					{
						logDebug("app spec info item " + itemName + " has been given a value of " + itemValue);
					}
					else 
					{
						logDebug("**ERROR: Setting the app spec info item " + itemName + " to " + itemValue + " .\nReason is: " + actionResult.getErrorType() + ":" + actionResult.getErrorMessage());
					}
					updated = true;
					AInfo[itemName] = itemValue;  // Update array used by this script
				}
				i++;
			} // while loop
		} // item name blank
	} // got app specific object    
	else
	{
		logDebug("**ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage());
	}
}//End Function
function logDebugLocal(dstr) {
	if (showDebug)
	{
		aa.print(dstr)
		aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr)
	}
}