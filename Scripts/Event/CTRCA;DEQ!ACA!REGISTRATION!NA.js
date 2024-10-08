
if (publicUser) {

	aa.cap.updateAccessByACA(capId, "N");
	var pinRequest = AInfo["Pin Request"];
	var reportFile = new Array();	
	if (pinRequest == 'Yes')
	{
		if (AInfo["Pin Request"] == 'Yes')
		{  
			recordID = AInfo["Record ID"];
			email = AInfo["Email Address"];
			capId = getApplication(recordID);	
			var capPeoples = getPeople(capId)
			var reportParams1 = aa.util.newHashtable();
			var emailParams = aa.util.newHashtable();	            
			for (loopk in capPeoples)
			{
				cont = capPeoples[loopk];                 
				peop = cont.getPeople();
				conEmail = peop.getEmail();
				logDebug("Scanning email: " + conEmail);

				if (matches(conEmail, email))
				{
					logDebug("Found matching email: " + conEmail);
					// Local contact ID
					localCId = cont.getCapContactModel().getPeople().getContactSeqNumber();			
					contactType = cont.getCapContactModel().getPeople().getContactType();
					reportParams1.put("ContactID", localCId);
					reportParams1.put("RecordID", capId.getCustomID());
					reportParams1.put("ContactType", contactType);			
					// ACA PIN - from reportParams1 above.      
					rFile = generateReportBatch(capId, "ACA Registration Pins-WWM", 'DEQ', reportParams1)					
							
					if (rFile) {
						reportFile.push(rFile);
					}

					getRecordParams4Notification(emailParams);	
					addParameter(emailParams, "$$altID$$", capId.getCustomID());					
    				var shortNotes = getShortNotes(capId);
					addParameter(emailParams, "$$shortNotes$$", shortNotes);					
					sendNotification("", conEmail, "", "DEQ_WWM_AWAITING CLIENT REPLY_WITH_ACA_PIN", emailParams, reportFile);					
					break;
				}

			}
		}
	}
	else
	{
		// ASI Table
		var pinTable = loadASITable("ACA REGISTRATION");

		for (var p in pinTable)
		{
			var pin = pinTable[p]["PIN"];
			var recordId = pinTable[p]["Record ID"];
			var id = pinTable[p]["Contact ID"];
			var licCap = aa.cap.getCapID(parseInt(pin)).getOutput();
			var contactID = parseInt(id);
			var recordIdString = recordId.toString();  

			var capIDString = licCap.getCustomID();     

			logDebug(pin + "," + recordId + "," + id + "," + licCap);

			logDebug("Switch to upper case: " + recordIdString.toUpperCase());
			var recordIdUpperCase = recordIdString.toUpperCase();

			if (licCap)
			{
				logDebug("CapIdString: " + capIDString + ", Record ID: " + recordId);
				if (matches(capIDString, recordIdUpperCase))
				{			
					logDebug("Matching:" + capIDString + "," + recordIdUpperCase);  
					editContactToSpecifcRecord(licCap, contactID, null);		
									
					// Set description
					updateWorkDesc("See FAQ for details. No further steps required.");        
					// Update Project Name
					var projectName = "DO NOT SUBMIT UNDER THIS APPLICATION - SUBMIT UNDER " + capIDString;
					// On ACA, this is short note
					updateShortNotes(projectName);        
					// On ACA, this is project name
					editAppName(projectName);
				}	
			}
		}
	}
	// Below is for single entry from ACA custom field
	/*
	var pin = aa.cap.getCapID(parseInt(AInfo["PIN"])).getOutput();
    var recordId = AInfo["Record ID"];
    var contactID = parseInt(AInfo["Contact ID"]);
    var capIDString = pin.getCustomID();     
    logDebug("Info: " + capIDString + "," + recordId + "," + contactID);

	if (pin) 
	{
		if (matches(capIDString, recordId))
		{			
			logDebug("Matching:" + capIDString + "," + recordId);  
			editContactToSpecifcRecord(pin, contactID);				
		}	
	}
	*/

}


function matches(eVal, argList) {
	for (var i = 1; i < arguments.length; i++) {
		if (arguments[i] == eVal) {
			return true;
		}
	}
	return false;
} 

function generateReportBatch(itemCap, reportName, module, parameters) {
    //returns the report file which can be attached to an email.
    var user = currentUserID; // Setting the User Name
    logDebug("user: " + user);
    logDebug("Resport Name: " + reportName);
    var report = aa.reportManager.getReportInfoModelByName(reportName);
    if (!report.getSuccess() || report.getOutput() == null)
    {
        logDebug("**WARN report generation failed, missing report or incorrect name: " + reportName);
        return false;
    }
    report = report.getOutput();
    report.setModule(module);
    report.setCapId(itemCap); //CSG Updated from itemCap.getCustomID() to just itemCap so the file would save to Record
    report.setReportParameters(parameters);

    var permit = aa.reportManager.hasPermission(reportName, user);

    if (permit.getOutput().booleanValue())
    {
        var reportResult = aa.reportManager.getReportResult(report);
        if (reportResult.getSuccess())
        {
            reportOutput = reportResult.getOutput();
            var reportFile = aa.reportManager.storeReportToDisk(reportOutput);
            reportFile = reportFile.getOutput();
            return reportFile;
        } else
        {
            logDebug("**WARN System failed get report: " + reportResult.getErrorType() + ":" + reportResult.getErrorMessage());
            return false;
        }
    } else
    {
        logDebug("You have no permission.");
        return false;
    }
}


