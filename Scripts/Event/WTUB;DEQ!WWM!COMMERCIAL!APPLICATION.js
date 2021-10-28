//WTUB:DEQ/WWM/Commercial/Application
var altId = capId.getCustomID();

// EHIMS-4747
if ((wfTask == "Plans Coordination" && wfStatus == "Approved") ||
(wfTask == "Inspections" && wfStatus == "Complete") ||
(wfTask == "Final Review" && wfStatus == "Approved"))
{
    var systemDetails  = loadASITable("SYSTEMDETAILS");
    logDebug("systemDetails: " + systemDetails);
    logDebug("systemDetails.length: " + systemDetails.length);

    if (systemDetails.length == 0)
    {
        cancel = true;
        showMessage = true;
        comment("CUSTOM LIST REQUIRED.");
    }
}

if ((wfTask == "Application Review" && wfStatus == "Accepted") ||
(wfTask == "Final Review" && wfStatus == "Create STP Monitoring Record"))
{
    if (wfStatus == "Create STP Monitoring Record")
    {
        if (balanceDue > 0)
        {
            cancel = true;
            showMessage = true;
            comment("Cannot proceed with fees due");
        }
    }
    var parentId = getParents("DEQ/General/Site/NA");
    

    if(altId.toString().contains("-ZEC"))
    {
        convertedRec = true;
    }
    else
    {
        convertedRec = false;
    }
    if (convertedRec == false) 
    {
        if (parentId != null)
        {
            for (p in parentId)
            {
                var itemCap = aa.cap.getCap(parentId[p]).getOutput();
                var appTypeResult = itemCap.getCapType();
                var appTypeString = appTypeResult.toString(); 
                var appTypeArray = appTypeString.split("/");
                var siteCheck = false;
                if (appTypeArray[0] == "DEQ" && appTypeArray[1] == "General" && appTypeArray[2] == "Site" && appTypeArray[3] == "NA")
                {
                    siteCheck = true;
                    break;
                }
            }
            if (!siteCheck)
            {
                cancel = true;
                showMessage = true;
                comment("There needs to be a parent SITE record before proceeding");
            }
        }
        else
        {
            cancel = true;
            showMessage = true;
            comment("There needs to be a parent SITE record before proceeding");
        }
    }
}

if (wfTask == "Plans Coordination" && wfStatus == "Approved")
{
    if (balanceDue > 0)
    {
        cancel = true;
        showMessage = true;
        comment("Cannot proceed with fees due");
    }

    
    var prelimCondTxt = AInfo["Permit Conditions Text"];
    if (matches(prelimCondTxt, null, undefined, ""))				
    {   
        showMessage = true;        
        comment("The custom field 'Permit Conditions Text' is blank, and the workflow was advanced without a notice or permit conditions document being generated, and no email was sent to the public.");
    }	
}


if (wfTask == "Application Review" && wfStatus == "Awaiting Client Reply")
{		
    var submissionNoticeTxt = AInfo["Submission Rejection Text"];
    if (matches(submissionNoticeTxt, null, undefined, ""))				
    {        
        showMessage = true;       	
        comment("The custom field 'Submission Rejection Text' is blank, and the workflow was advanced without a notice or permit conditions document being generated, and no email was sent to the public. ");
    
    }
}


if (wfTask == "Plans Coordination" && wfStatus == "Plan Revisions Needed")
{	
    var notOK = isTaskStatus("WWM Review", "Not OK");
	logDebug("Is this okay? : " + notOK);
    if(notOK)
    {
        var prelimNoticeTxt = AInfo["Preliminary Notice Text"];
        if (matches(prelimNoticeTxt, null, undefined, ""))				
        {           
            showMessage = true;
            comment("The custom field 'Preliminary Notice Text' is blank, and the workflow was advanced without a notice or permit conditions document being generated, and no email was sent to the public. ");
        }	
    }
}

if (wfTask == "Inspections" &&  (wfStatus == "Inspection Failure" || wfStatus == "Inspection Failure- I/A Installed"))
{
    var resultComments = inspectionResultComments();

    if (!resultComments)
    {       
        showMessage = true;            
        comment("The inspection result comment is required to be filled out.");        
    }
    
}
if ((wfTask == "Final Review" && wfStatus == "Awaiting Client Reply") ||
(wfTask == "Inspections" && wfStatus == "Awaiting Client Reply"))
{    
    var finalNoticeTxt = AInfo["Final Notice Text"];
    if (matches(finalNoticeTxt, null, undefined, ""))				
    {        
        showMessage = true;        
        comment("The custom field 'Final Notice Text' is blank, and the workflow was advanced without a notice or permit conditions document being generated, and no email was sent to the public. ");
    }
    
}

function inspectionResultComments()
{
	var insps;
	var inspResultComments = false;
	var inspections = aa.inspection.getInspections(capId);
	var latestInspDate = null;
	var inspIdToUse;

	logDebug("Has Inspections: " + inspections.getSuccess());
	if (inspections.getSuccess()) 
	{
		insps = inspections.getOutput();
		
		// Get the latest inspection
		for (i in insps) 
		{				
			logDebug("inspection comment: " + insps[i].getInspectionComments());
			logDebug("Inspection Date:" + insps[i].getInspectionDate());
			logDebug("getInspectionStatus: " + insps[i].getInspectionStatus());		
			logDebug("comment?: " + insps[i].inspection.getResultComment());

			if (insps[i].getInspectionDate() != null && insps[i].inspection.getResultComment() != null &&
			insps[i].getInspectionStatus() == "Incomplete")
			{
				var inspDate = new Date(insps[i].getInspectionDate().getMonth() + "/" + insps[i].getInspectionDate().getDayOfMonth() + "/" + insps[i].getInspectionDate().getYear());
				logDebug("inspDate: " + inspDate);			
	
				var year = insps[i].getInspectionDate().getYear();
				var month = insps[i].getInspectionDate().getMonth() - 1;
				var day = insps[i].getInspectionDate().getDayOfMonth();
				var hr = insps[i].getInspectionDate().getHourOfDay();
				var min = insps[i].getInspectionDate().getMinute();
				var sec = insps[i].getInspectionDate().getSecond();
				logDebug("year, month, day, hr, min, sec:" + year + "," + month + "," + day + "," + hr + "," + min + "," + sec);
				var newDate = new Date(year, month, day, hr, min, sec);
				logDebug("newDate:" + newDate);

				if (latestInspDate == null || (latestInspDate > newDate))
				{
					inspIdToUse = insps[i].getIdNumber();
					logDebug("getIDNumber: " + inspIdToUse);
					logDebug("latestInspDate: " + latestInspDate);
					logDebug("newDate: " + newDate);
					latestInspDate = newDate;
					logDebug("latestInspDate is greater than newDate");
					inspResultComments = true;
				}				
			}					
		}	
	}
	
	return inspResultComments;
}