var complaintNumber = getAppSpecific("Complaint Number", capId);
var licenseNumber = getAppSpecific("License Number", capId);
    
	// Link License Number to Complaint and Docket
	if (!matches(licenseNumber, null, ""))
	{
		var capLicResult = aa.cap.getCapID(licenseNumber);
		if (capLicResult.getSuccess()) {
			licCapId = capLicResult.getOutput();

			// License as Parent -> Complaint as Child
			var capComplaintResult = aa.cap.getCapID(complaintNumber);
			if (capComplaintResult.getSuccess()) {
				recCapId = capComplaintResult.getOutput();

				var linkResult = aa.cap.createAppHierarchy(licCapId, recCapId);
				if (linkResult.getSuccess())
					logDebug("Successfully linked Complaint Record as child of license record: " + recCapId);
				else
					logDebug( "**ERROR: linking to parent application parent cap id (" + licCapId + "): " + linkResult.getErrorMessage());

			}

			// Complaint as Parent -> Docket as Child
			var linkLResult = aa.cap.createAppHierarchy(recCapId, capId);
			if (linkLResult.getSuccess())
				logDebug("Successfully linked to Docket Record as child of Complaint record : " + recCapId);
			else
				logDebug( "**ERROR: linking to parent application parent cap id (" + recCapId + "): " + linkLResult.getErrorMessage());

					
		}
	}
	else // No license number. Just link docket to complaint record.
	{
		// Complaint as Parent -> Docket as Child
		var capComplaintResult = aa.cap.getCapID(complaintNumber);
		if (capComplaintResult.getSuccess()) {
			recCapId = capComplaintResult.getOutput();

			var linkResult = aa.cap.createAppHierarchy(recCapId, capId);
			if (linkResult.getSuccess())
				logDebug("Successfully linked Docket record as child to Complaint Record: " + recCapId);
			else
				logDebug( "**ERROR: linking to parent application parent cap id (" + recCapId + "): " + linkResult.getErrorMessage());

		}
		
	}

	
	
	