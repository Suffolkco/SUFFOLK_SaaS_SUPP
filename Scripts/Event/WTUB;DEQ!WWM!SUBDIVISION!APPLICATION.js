//WTUB:DEQ/WWM/Subdivision/Application
var altId = capId.getCustomID();

// EHIMS-4806
if (wfTask == "Plans Distribution" && wfStatus == "Routed for Review")
{		
	var multiTaxMap = AInfo["Tax Map Numbers"];
	if (multiTaxMap != null)
    {
        cancel = true;
        showMessage = true;
        comment("There are multiple tax map numbers for this application - make sure all tax map numbers are entered into the Parcel portlet. Workflow cannot be advanced until custom field “multiple tax map numbers” is emptied.");
    }

    var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);
    if (capParcelResult.getSuccess())
    {
        var Parcels = capParcelResult.getOutput().toArray();
        for (zz in Parcels)
        {
            var parcelNumber = Parcels[zz].getParcelNumber();
            //logDebug("parcelNumber = " + parcelNumber);
                           
            if (parcelNumber != null)
            {
                //logDebug("Data Entry - Parcel No: " + parcelNumber + ", Length: " + parcelNumber.length());						
                var parcelTxt = new String(parcelNumber);
                noSpaceParcelNo = parcelTxt.replace(/\s/g, '');				
                var length = noSpaceParcelNo.length;
                //logDebug("Removed space- Parcel No: " + noSpaceParcelNo + ", Length: " + length);
                //logDebug("ParcelNo: " + noSpaceParcelNo + ", " + length);
                if (length != 19)        
                {            
                    cancel = true;
                    showMessage = true;
                    comment("One or more tax map numbers (in parcel portlet) are incorrect - verify all tax map numbers are exactly 19 digits long.");
                    //comment ("Parcel (Tax Map) Number must be 19 digits; you entered " + length + " digits.");				
                }				
            }            
        }
    }
}

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

// EHIMS-4832
// Check to see if new document has been updated by public user
if (wfTask == "Plans Coordination" && ( wfStatus == "Approved" || wfStatus == "Awaiting Client Reply" || wfStatus == "Plan Revisions Needed"))
{	
	var readValue =  AInfo["New Documents Uploaded"]
	// Use ASI instead of TSI
	//var readValue = loadTaskSpecific(wfTask, "New documents uploaded");
	if (readValue != null && readValue == 'CHECKED')
	{
		//Reset the flag. Instead user will manually do it.
		//editAppSpecific("New documents uploaded", "UNCHECKED", capId);
		cancel = true;
		showMessage = true;
		comment("A new submission was made since the start of your review - verify that the latest documents or payments have been reviewed and uncheck the “New Documents” box in custom field.");		
		
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
function dateDifference(date1, date2)
{
    return (convertDate(date2).getTime() - convertDate(date1).getTime()) / (1000 * 60 * 60 * 24);
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
				var month = insps[i].getInspectionDate().getMonth();
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


