var complaintNumber = getAppSpecific("Complaint Number", capId);
	var licenseNumber = getAppSpecific("License Number", capId);
    
	// Link Complaint Number
	var capComplaintResult = aa.cap.getCapID(complaintNumber);
	if (capComplaintResult.getSuccess()) {
		recCapId = capComplaintResult.getOutput();

		var linkResult = aa.cap.createAppHierarchy(recCapId, capId);
		if (linkResult.getSuccess())
			logDebug("Successfully linked to Complaint Record: " + capId);
		else
			logDebug( "**ERROR: linking to parent application parent cap id (" + recCapId + "): " + linkResult.getErrorMessage());

	}
	
	// Link License Number
	var capLicResult = aa.cap.getCapID(licenseNumber);
	if (capLicResult.getSuccess()) {
		licCapId = capLicResult.getOutput();

		var linkLResult = aa.cap.createAppHierarchy(licCapId, capId);
		if (linkLResult.getSuccess())
			logDebug("Successfully linked to Parent Application : " + capId);
		else
			logDebug( "**ERROR: linking to parent application parent cap id (" + licCapId + "): " + linkLResult.getErrorMessage());

	}