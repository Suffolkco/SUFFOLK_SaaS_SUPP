var complaintNumber = getAppSpecific("Complaint Number", capId);
var licenseNumber = getAppSpecific("License Number", capId);
    

	// Link License Number to Complaint and Docket
	if (!matches(licenseNumber, null, ""))
	{
		var capLicResult = aa.cap.getCapID(licenseNumber);
		if (capLicResult.getSuccess()) {
			licCapId = capLicResult.getOutput();

			// License as Parent -> Complaint 
			var capComplaintResult = aa.cap.getCapID(complaintNumber);
			if (capComplaintResult.getSuccess()) {
				recCapId = capComplaintResult.getOutput();

				var linkResult = aa.cap.createAppHierarchy(licCapId, recCapId);
				if (linkResult.getSuccess())
					logDebug("Successfully linked to Complaint Record: " + recCapId);
				else
					logDebug( "**ERROR: linking to parent application parent cap id (" + licCapId + "): " + linkResult.getErrorMessage());

			}

			// License as Parent -> Docket 
			var linkLResult = aa.cap.createAppHierarchy(licCapId, capId);
			if (linkLResult.getSuccess())
				logDebug("Successfully linked to Parent License Record : " + licCapId);
			else
				logDebug( "**ERROR: linking to parent application parent cap id (" + licCapId + "): " + linkLResult.getErrorMessage());

				// Link Complaint Number		
		}
	}

	
	
	