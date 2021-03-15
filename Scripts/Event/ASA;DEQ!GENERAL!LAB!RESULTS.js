//ASA:DEQ/GENERAL/LAB/RESULTS
var showDebug = false;
var capIdInsp = undefined;
var capIdCheck = undefined;
var samEven = getAppSpecific("Sample Event #");
logDebug("Sample Event # is: " + samEven);
 
if (samEven != null)
{
    if (!samEven.contains("-"))
    {
        capIdInsp = getCapIdByInspID(samEven);
    }
    else
    {
        capIdCheck = getCapIdByChecklistID(samEven);
    }
    if (capIdInsp != undefined)
    {
        var linkResult = aa.cap.createAppHierarchy(capIdInsp, capId);
        if (linkResult.getSuccess())
        {
            logDebug("Successfully linked to Site Application : " + capIdInsp.getCustomID());
            var inspectionResult = aa.inspection.getInspections(capIdInsp);
            if (inspectionResult.getSuccess())
            {
                var insObj = inspectionResult.getOutput();
                for (i in insObj)
                {
                    if (insObj[i].getIdNumber() == samEven)
                    {
                        insObj[i].setInspectionStatus("Lab Results Returned");
                        aa.inspection.editInspection(insObj[i]);
                        break;
                    }
                }
            }
        }
        else
        {
            logDebug( "**ERROR: linking to Site application parent cap id (" + capIdInsp + "): " + linkResult.getErrorMessage());
        }
    }
    else if (capIdCheck != undefined)
    {
        var linkResult = aa.cap.createAppHierarchy(capIdCheck, capId);
        if (linkResult.getSuccess())
        {
            logDebug("Successfully linked to Site Application : " + capIdCheck.getCustomID());
            var inspectionResult = aa.inspection.getInspections(capIdCheck);
            if (inspectionResult.getSuccess())
            {
                var insObj = inspectionResult.getOutput();
                outerLoop:
                for (i in insObj)
                {
                    var inspModel = insObj[i].getInspection();
                    var gs = inspModel.getGuideSheets();
                    if (!gs.isEmpty())
                    {
                        for(var j=0; j < gs.size(); j++) 
                        {
                            var guideSheetObj = gs.get(j);
                            if (guideSheetObj.getGuideType().toUpperCase() == "LAB METHODS") 
                            {
                                if (guideSheetObj.getIdentifier() == samEven)
                                {
                                    insObj[i].setInspectionStatus("Lab Results Returned");
                                    aa.inspection.editInspection(insObj[i]);
                                    break outerLoop;
                                }
                            }
                        }
                    }
                }
            }
        }
        else
        {
            logDebug( "**ERROR: linking to Site application parent cap id (" + capIdCheck + "): " + linkResult.getErrorMessage());
        }
    }
    else
    {
        logDebug("The Inspection number/Checklist ID are invalid, Lab Results will not be linked to Site");
    }
}
else
{
    logDebug("Sample Event # has been left null, script will not execute");
}