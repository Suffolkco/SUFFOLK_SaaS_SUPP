var showDebug = false;
var wwmNumber = AInfo["WWM Application Number"];
logDebug("WWM number is: " + wwmNumber);

var manu = getAppSpecific("Manufacturer");
var model = getAppSpecific("Model Number");
var install = getAppSpecific("Installation Date");

updateWorkDesc(manu + " " + model + " " + install);

var description = workDescGet(capId);
//logDebug("My description is now: " + description);

var getCapResult = aa.cap.getCapID(wwmNumber);
var wwmId = getCapResult.getOutput();
if (getCapResult.getSuccess())
{
	var linkResult = aa.cap.createAppHierarchy(wwmId, capId);
	if (linkResult.getSuccess())
	{
		logDebug("Successfully linked to Parent Application : " + wwmId);
	}
	else 
	{
		logDebug("No table found.");
	}

	var resultDate = new Date(AInfo["Installation Date"]);
	if (resultDate != null)
	{
		var contractTerm = AInfo["Contract Term"];
		var contractStartDate = new Date(AInfo["Contract Start Date"]);

		if (contractTerm == '1 year')
		{
			var newExpDate = (contractStartDate.getMonth() + 1) + "/" + contractStartDate.getDate() + "/" + (contractStartDate.getFullYear() + 1);
			editAppSpecific("Contract Expiration Date", newExpDate);
		}
		else if (contractTerm == '3 year')
		{
			var newExpDate = (contractStartDate.getMonth() + 1) + "/" + contractStartDate.getDate() + "/" + (contractStartDate.getFullYear() + 3);
			editAppSpecific("Contract Expiration Date", newExpDate);

		}
		else if (contractTerm == '5 year')
		{
			var newExpDate = (contractStartDate.getMonth() + 1) + "/" + contractStartDate.getDate() + "/" + (contractStartDate.getFullYear() + 5);
			editAppSpecific("Contract Expiration Date", newExpDate);
		}

		var dateCon = resultDate.getMonth() + "/" + resultDate.getDate() + "/" + resultDate.getFullYear();
		logDebug("Inspection result date is: " + dateCon);
		var dateAddThree = (resultDate.getMonth() + 1) + "/" + resultDate.getDate() + "/" + (resultDate.getFullYear() + 3);
		var dateAddOne = (resultDate.getMonth() + 1) + "/" + resultDate.getDate() + "/" + (resultDate.getFullYear() + 1);

		logDebug("Date add 3 year is: " + dateAddThree);
		logDebug("Date add 1 year is: " + dateAddOne);

		editAppSpecific("Next Service Date", dateAddOne);
		editAppSpecific("Next Sample Date", dateAddThree);

		appTypeResult = aa.cap.getCap(wwmId).getOutput().getCapType();
		appTypeString = appTypeResult.toString();
		appTypeArray = appTypeString.split("/");
		var capType = appTypeArray[2];
		logDebug("cap type is: " + capType);

		if (capType == "Residence")
		{
			editAppSpecific("Type", "Residential");
		}
		else 
		{
			editAppSpecific("Type", capType);
		}
	}
	if (!publicUser)
	{
		var IANumber = "" + getAppSpecific("IA Number", wwmId);
		if (IANumber == null || IANumber == "null")
		{
			IANumber = capId.getCustomID();
		}
		else
		{
			IANumber += " " + capId.getCustomID();
		}
		logDebug("IA NUMBER: " + IANumber);
		editAppSpecific("IA Number", IANumber, wwmId);

		var lpArr;
		var lpResult = aa.licenseScript.getLicenseProf(capId);
		logDebug("hitting function.");
		if (lpResult.getSuccess())
		{
			lpArr = lpResult.getOutput();
		}
		if (lpArr != null)
		{
			var emailAddress = "";
			for (var lp in lpArr)
			{
				logDebug("The type it is: " + lpArr[lp].getLicenseType() + " the type we are looking for: " + "Service Provider");
				if (lpArr[lp].getLicenseType() == "Service Provider")
				{
					emailAddress = lpArr[lp].getEmail();
					//ECOLOGY_IA_NOTIFY_SERVICEPROVIDER

					var params = aa.util.newHashtable();
					var altId = capId.getCustomID();
					getRecordParams4Notification(params);
					addParameter(params, "ALTID", altId);
					sendNotification("", emailAddress, "", "ECOLOGY_IA_NOTIFY_SERVICEPROVIDER", params, null);
				}
			}
		}
		var pinNumber = makePIN(8);
		editAppSpecific('IA PIN Number', pinNumber, capId);
	}
}


function dateAdd(td, amt) {
	// perform date arithmetic on a string
	// td can be "mm/dd/yyyy" (or any string that will convert to JS date)
	// amt can be positive or negative (5, -3) days
	// if optional parameter #3 is present, use working days only
	var dDate;
	var useWorking = false;
	if (arguments.length == 3)
	{
		useWorking = true;
	}
	if (!td)
	{
		dDate = new Date();
	} else
	{
		dDate = td;
	}
	var i = 0;
	if (useWorking)
	{
		if (!aa.calendar.getNextWorkDay)
		{
			logDebug("getNextWorkDay function is only available in Accela Automation 6.3.2 or higher.");
			while (i < Math.abs(amt))
			{
				dDate.setTime(dDate.getTime() + (1000 * 60 * 60 * 24 * (amt > 0 ? 1 : -1)));
				if (dDate.getDay() > 0 && dDate.getDay() < 6)
				{
					i++
				}
			}
		} else
		{
			while (i < Math.abs(amt))
			{
				dDate = new Date(aa.calendar.getNextWorkDay(aa.date.parseDate(dDate.getMonth() + 1 + "/" + dDate.getDate() + "/" + dDate.getFullYear())).getOutput().getTime());
				i++;
			}
		}
	} else
	{
		dDate.setTime(dDate.getTime() + (1000 * 60 * 60 * 24 * amt));
	}
	return (dDate.getMonth() + 1) + "/" + dDate.getDate() + "/" + dDate.getFullYear();
}

function makePIN(length) {
	var result = '';
	var characters = 'ABCDEFGHJKMNPQRTWXY2346789';
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++)
	{
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}