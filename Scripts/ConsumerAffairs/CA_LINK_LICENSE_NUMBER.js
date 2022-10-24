var complaintNumber = getAppSpecific("Complaint Number", capId);
	var licenseNumber = getAppSpecific("License Number", capId);
    
	// Link Complaint Number
	var capComplaintResult = aa.cap.getCapID(complaintNumber);
	if (capComplaintResult.getSuccess()) {
		recCapId = capComplaintResult.getOutput();

		var linkResult = aa.cap.createAppHierarchy(capId, recCapId);
		if (linkResult.getSuccess())
			logDebug("Successfully linked to Complaint Record: " + capId);
		else
			logDebug( "**ERROR: linking to parent application parent cap id (" + capId + "): " + linkResult.getErrorMessage());

	}
	
	// Link License Number
	var capLicResult = aa.cap.getCapID(licenseNumber);
	if (capLicResult.getSuccess()) {
		licCapId = capLicResult.getOutput();

		var linkLResult = aa.cap.createAppHierarchy(capId, licCapId);
		if (linkLResult.getSuccess())
			logDebug("Successfully linked to Parent Application : " + capId);
		else
			logDebug( "**ERROR: linking to parent application parent cap id (" + capId + "): " + linkLResult.getErrorMessage());

	}