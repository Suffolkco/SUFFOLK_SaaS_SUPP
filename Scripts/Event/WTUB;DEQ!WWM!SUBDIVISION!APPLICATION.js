//WTUB:DEQ/WWM/Subdivision/Application
var altId = capId.getCustomID();

// EHIMS-4754
if (wfTask == "Inspections" && wfStatus == "Complete")
{		
	var completed = latestCompletedInspection();
	if (!completed)
    {
        cancel = true;
        showMessage = true;
        comment("The latest inspeciton has not been completed; workflow was not advanced.</br>");
    }
}


if ((wfTask == "Application Review" && (wfStatus == "Accepted") || wfStatus == "STP Application"))
{
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
        var parentId = getParents("DEQ/General/Site/NA");                                              
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
       /*
    var prelimCondTxt = AInfo["Permit Conditions Text"];
    if (matches(prelimCondTxt, null, undefined, ""))				
    {   
        showMessage = true;        
        comment("The custom field 'Permit Conditions Text' is blank, and the workflow was advanced without a notice or permit conditions document being generated, and no email was sent to the public.");
    }*/	
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

function latestCompletedInspection()
{
	var insps;
	var inspCompleted = false;
	var inspections = aa.inspection.getInspections(capId);
	var shortestdays = null;
	var inspIdToUse;
	
	if (inspections.getSuccess()) 
	{
		insps = inspections.getOutput();
		
		// Get the latest inspection
		for (i in insps) 
		{				
			
			if (insps[i].getInspectionDate() != null)
			{
				var inspDate = new Date(insps[i].getInspectionDate().getMonth() + "/" + insps[i].getInspectionDate().getDayOfMonth() + "/" + insps[i].getInspectionDate().getYear());
				logDebug("inspDate: " + inspDate);			
	
				var year = insps[i].getInspectionDate().getYear();
				var month = insps[i].getInspectionDate().getMonth() - 1;
				var day = insps[i].getInspectionDate().getDayOfMonth();
				var hr = insps[i].getInspectionDate().getHourOfDay();
				var min = insps[i].getInspectionDate().getMinute();
				var sec = insps[i].getInspectionDate().getSecond();
				var todaysDate = new Date();			
				var todDateCon = (todaysDate.getMonth() + 1) + "/" + todaysDate.getDate() + "/" + (todaysDate.getFullYear());
				
				var inspectionDateCon = month + "/" + day + "/" + year;
				
				logDebug("Today Date is: " + todDateCon + ". Inspection Date is: " + inspectionDateCon);					
				var dateDiff = parseFloat(dateDifference(inspectionDateCon, todDateCon));
				logDebug("Day difference is: " + dateDiff);
				

				if (shortestdays == null || (dateDiff < shortestdays))
				{
					inspIdToUse = insps[i].getIdNumber();
					logDebug("getIDNumber: " + inspIdToUse);
					logDebug("Date difference is: " + dateDiff + " which is shorter than: " + shortestdays);					
					shortestdays = dateDiff;	
				}				
				
							
			}	
			if (shortestdays != null)
			{	
				logDebug("Latest inspection ID is: " + inspIdToUse + ", Inspection date: " + shortestdays + " with status: " + insps[i].getInspectionStatus());								
			}
		}	

		// Only look at the most recent inspection with status "Incomplete"
		var inspResultObj = aa.inspection.getInspection(capId, inspIdToUse);
		logDebug("Inspection ID:" + inspIdToUse);		

		if (inspResultObj.getSuccess()) 
		{
			var inspObj = inspResultObj.getOutput();
			logDebug("Inspection Status:" + inspObj.getInspectionStatus());	
			if (inspObj && inspObj.getInspectionStatus() == "Complete")
			{
				inspCompleted = true;
				logDebug("Inspection ID is used:" + inspIdToUse);		
			}
		}
	}
	return inspCompleted;
}


