var showDebug = false;
var parentId = getParent();
var daysAdd;

var conUpdate = getAppSpecific("Contract Update", capId);
var serviceReport = getAppSpecific("Service Report", capId);
var sampleResults = getAppSpecific("Sample Results", capId);
var parConExp = getAppSpecific("Contract Expiration Date", parentId);
var conStartServ = getAppSpecific("Contract Start Date", capId);
var contermServ = getAppSpecific("Contract Term", capId);
var myCap = capId;
var contractAnualCost = getAppSpecific("Contract Annual Cost", capId);
var myCustomCap = myCap.getCustomID();
var use = getAppSpecific("Use", capId);
var serviceDate = new Date(AInfo["Service Date"]);
var sampleDate = new Date(AInfo["Sample Collection Date"]); 
var phase = getAppSpecific("Phase", capId);
var process = getAppSpecific("Process", capId);
var collection = getAppSpecific("Collection", capId);
var collector = getAppSpecific("Collector", capId);
var fieldId = getAppSpecific("Field ID", capId);
var lab = getAppSpecific("Lab", capId);

logDebug("Actual parent ID: " + parentId);
logDebug("wfTask: " + wfTask);
logDebug("wfStatus: " + wfStatus);

var collectionDate = getAppSpecific("Sample Collection Date", capId);
var parentTable = loadASITable("LAB RESULTS AND FIELD DATA", capId);
var labResultsTable = new Array();
for (var l in parentTable)
{
	var newRow = new Array();
	newRow["Lab ID"] = parentTable[l]["Lab ID"];
	newRow["Source"] = myCustomCap;
	newRow["TN"] = parentTable[l]["TN"];
	newRow["NO3 Nitrate"] = parentTable[l]["NO3 Nitrate"];
	newRow["NO2 Nitrite"] = parentTable[l]["NO2 Nitrite"];
	newRow["TKN"] = parentTable[l]["TKN"];
	newRow["NH4 Ammonia"] = parentTable[l]["NH4 Ammonia"];
	newRow["BOD"] = parentTable[l]["BOD"];
	newRow["TSS"] = parentTable[l]["TSS"];
	newRow["ALK"] = parentTable[l]["ALK"];
	newRow["DO"] = parentTable[l]["DO"];
	newRow["PH"] = parentTable[l]["PH"];
	newRow["WW Temp"] = parentTable[l]["WW Temp"];
	newRow["Air Temp"] = parentTable[l]["Air Temp"];
	newRow["Process"] = parentTable[l]["Process"];
    newRow["Collection"] = parentTable[l]["Collection"];
    newRow["Lab"] = parentTable[l]["Lab"];
    newRow["Comment"] = parentTable[l]["Comment"]
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

addASITable("LAB RESULTS", labResultsTable, parentCapId);
editAppSpecific("Use", use, parentCapId);

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

                if (capContacts[yy].getPeople().getAuditStatus() == "A") {
                    capContacts[yy].getPeople().setAuditStatus("I"); 
                    aa.people.editCapContact(capContacts[yy].getCapContactModel());
                    logDebug("Contact Status: " + capContacts[yy].getPeople().getAuditStatus());
                    logDebug("We Got in here");
                }
            }
    }
	if (conUpdate == "CHECKED")
	{
		var contractDate = new Date(conStartServ); 

		var datePlusCon = (contractDate.getMonth() + 1) + "/" + contractDate.getDate() + "/" + contractDate.getFullYear();

		if (conStartServ != 'null')
		{
			editAppSpecific("Contract Start Date", conStartServ, parentCapId); 
    		editAppSpecific("Contract Term", contermServ, parentCapId);
			datePlusCon = (contractDate.getMonth() + 1) + "/" + contractDate.getDate() + "/" + (contractDate.getFullYear() + Number(contermServ));
			editAppSpecific("Contract Expiration Date", datePlusCon, parentCapId);
		}

		if (contractAnualCost != null)
		{
			editAppSpecific("Contract Annual Cost", contractAnualCost, parentCapId);
		}

		/* logDebug("conStartServ is: " + datePlusCon);
		 //aa.print("datePlusCon is: " + datePlusCon);
		 logDebug("Contract Expiration Date: " + datePlusCon);
		 editAppSpecific("Contract Expiration Date", datePlusCon, parentId);
					 	
		 logDebug("Remove old one at parent id"); 
		 copyLicenseProfessionalForLic(capId, parentId); 
		 logDebug("Add new in parent");
		 removeUnmatchedProfessionals(capId, parentId);
		 logDebug("Copied done?");*/

	}
	// Service Date
	if (serviceReport == "CHECKED")
	{
		var nextServiceDate = (serviceDate.getMonth() + 1) + "/" + serviceDate.getDate() + "/" + (serviceDate.getFullYear() + 1);
		logDebug("Next Service Date: " + nextServiceDate);
		editAppSpecific("Next Service Date", nextServiceDate, parentId);
	}
	// Sample Collection Date
	if (sampleResults == "CHECKED")
	{
		var nextSampleDate = (sampleDate.getMonth() + 1) + "/" + sampleDate.getDate() + "/" + (sampleDate.getFullYear() + 3);
		logDebug("Next Sample Date: " + nextSampleDate);
		editAppSpecific("Next Sample Date", nextSampleDate, parentId);
	}

}

function addDays(date, days) 
{
	var result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}

function copyLicenseProfessionalForLic(srcCapId, targetCapId)
{

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
function removeUnmatchedProfessionals(srcCapId, targetCapId) 
{
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

function removeAllProfessionals(targetCapId)
{
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

function copyAllProfessionals(srcCapId, targetCapId) 
{
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


function setPrimaryLicProf(capId)
{

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


function removeLicenseProfessionalForLic(srcCapId, targetCapId)
{
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

function debugObject(object)
{
	var output = '';
	for (property in object)
	{
		output += "<font color=red>" + property + "</font>" + ': ' + "<bold>" + object[property] + "</bold>" + '; ' + "<BR>";
	}
	logDebug(output);
} 
