// DOCKET-29

if (wfTask == "Enter Hearing Info" && wfStatus == "Complete")
{		

    licenseNumber = getAppSpecific("License Number", capId)
    licenseCapId = getApplication(licenseNumber);

    if (licenseCapId)
    {
        // Valid license number
    }
    else
    {
        cancel = true;
        showMessage = true;
        comment("License Number in ASI/Custom Field is not valid. Please enter valid License Number.");
	}

    // DOCKET - 23/30: Custom Field required fields
    if (getAppSpecific("License Vendor Attorney Present", capId) == null || 
    getAppSpecific("Consumer Attorney Present", capId) == null || 
    getAppSpecific("Vendor Present", capId) == null || 
    getAppSpecific("Consumer Present", capId) == null || 
    getAppSpecific("Vendor Witnesses", capId) == null || 
    getAppSpecific("Consumer Witnesses", capId) == null || 
    getAppSpecific("Translator Used", capId) == null)
    {
    
        cancel = true;
        showMessage = true;
        comment("Hearing section in ASI/Custom Field must be filled in. Please go to Custom Field tab to input all values.");
        
    }
}
// DOCKET #12: Block the workflow task "Create Violation Cheat Sheet" from proceeding if all documents have not been attached.
else if (wfTask == "Create Violation Cheat Sheet" && wfStatus == "Complete")
{
    exhibitA = determineDocumentAttached("Contract");
    exhibitB = determineDocumentAttached("Canceled Checks");
    exhibitC = determineDocumentAttached("Affidavit");
    exhibitD = determineDocumentAttached("DMV Search");
    exhibitE = determineDocumentAttached("TLO Search");
    exhibitF = determineDocumentAttached("NYS DOS Search");
    exhibitG = determineDocumentAttached("DBA Search Cert. County Clerk");
    exhibitH = determineDocumentAttached("Consumer Complaint Form");
    exhibitI = determineDocumentAttached("Judgment");
    exhibitJ = determineDocumentAttached("License Search Printout");
    exhibitK = determineDocumentAttached("2nd Vendor Estimates");
    exhibitL = determineDocumentAttached("Past NOD for 2nd Counts");
    exhibitM = determineDocumentAttached("Town Building Dept. Inspection Certificates");

    if (!exhibitA || !exhibitB || !exhibitC || !exhibitD || !exhibitE || !exhibitF || !exhibitG || !exhibitH ||
        !exhibitI || !exhibitJ || !exhibitK || !exhibitL || !exhibitM)
    {
        cancel = true;
        showMessage = true;
        comment("All Exhibit document types have not been attached.");
    }
    
}
// DOCKET #7: Docket Type Script: Block to proceed if AOS has not been scanned at workflow task Notice of Hearing -> next step
else if (wfTask == "Notice of Hearing" && wfStatus == "Complete")
{
    //Check if the AOS has not been scanned 
    aosCheck = determineDocumentAttached("Affidavit");
    
    if(!aosCheck)
    {
        cancel = true;
        showMessage = true;
        comment("No AOS document has been attached. Please attach Affidavit document before proceeding. Unable to move to the next task.");
    }

    // DOCKET #9: lBlock letter has not been mailed
    var a63 =  AInfo["A63 Unlicensed"]
	var a64 =  AInfo["A64 Unlicensed"]
	var a65 =  AInfo["A65 Unlicensed"]
    var a66 =  AInfo["A66 Unlicensed"]
    var a67 =  AInfo["A67 Adjournment Letter"]
    var a67a = AInfo["A67a COVID19 Adjournment Letter"]
    var a68 =  AInfo["A68 Adjournment Letter"]
    var a69 =  AInfo["A69 Notification"]
    var a70 =  AInfo["A70 Notification"]
    var a71 =  AInfo["A71 Notification"]
    var a72 =  AInfo["A72 Notification"]
    var a73 =  AInfo["A73 Adjournment Letter"]
    var a74 =  AInfo["A74 Adjournment Letter"]
    var a75 =  AInfo["A75 Adjournment Letter"]
    var a76 =  AInfo["A76 Adjournment Letter"]

	if (a63 == 'CHECKED' || a64 == 'CHECKED' || a65 == 'CHECKED' || a66 == 'CHECKED' || a67 == 'CHECKED' || a67a == 'CHECKED' ||
    a68 == 'CHECKED' || a69 == 'CHECKED' || a70 == 'CHECKED' || a71 == 'CHECKED'
    || a72 == 'CHECKED' || a73 == 'CHECKED' || a74 == 'CHECKED'
    || a75 == 'CHECKED' || a76 == 'CHECKED')
    {
        // Letter checkbox has been checked.
    }
    else
	{		
		cancel = true;
		showMessage = true;
		comment("At least one letter has to be mailed. Please check ASI Letter choices to indicate. Unable to proceed.");		
    }
		


}
// DOCKET #6: At Hearing, WTUA to block from proceeding if audio recording has not been attached
else if (wfTask == "Hearing" && (wfStatus == "Full Hearing" || wfStatus == "Default"))
{
    //Check if the audio hearing has not been scanned 
    audioCheck = determineDocumentAttached("Audio Hearing Recording");

    if(!audioCheck)
    {
        cancel = true;
        showMessage = true;
        comment("No audio hearing recording has been attached. Please upload before proceeding. Unable to move to the next task.");
    }
}

function determineDocumentAttached(docType) 
{
    var docList = aa.document.getDocumentListByEntity(capId, "CAP");
    if (docList.getSuccess()) 
	{
        docsOut = docList.getOutput();
		logDebug("Docs Out " + docsOut.isEmpty());
        if (docsOut.isEmpty()) 
		{
            logDebug("here");
            return false;
        }
        else 
		{
            attach = false;
            docsOuti = docsOut.iterator();
            while (docsOuti.hasNext()) 
			{
                doc = docsOuti.next();
				//debugObject(doc);
                docCat = doc.getDocCategory();
                if (docCat.equals(docType)) 
				{
                    attach = true;
                }
            }
            if (attach) 
			{
                return true;
            }
            else 
			{
                return false;
            }
        }
    }
    else 
	{
        return false;
    }
}

