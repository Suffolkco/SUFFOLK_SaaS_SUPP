//ISA;DEQ!WWM!~!Application
showDebug = true;
// Not used anymore
/*
inspId 566190   // is the new inspection
inspInspector =
InspectorFirstName = null
InspectorMiddleName = null
InspectorLastName = null
inspGroup = WWM_INSP
inspType = WWM_RES_System 1
inspSchedDate = 1/18/2022 */




if (inspType == "WWM_RES_System 1")
{
    logDebug("current insp ID is: " + inspId);
    var inspModel = aa.inspection.getInspection(capId, inspId);
    logDebug("inspModel is: " + inspModel);
    //getting guidesheets from inspection being scheduled
    var gs = inspModel.getGuideSheets();
    if (!gs.isEmpty())
    {
        //looping through those guidesheets and removing any that exist before inspection is done being scheduled
        for (var gLoop = 0; gLoop < gs.size(); gLoop++)
        {
            var guideSheetObj = gs.get(gLoop);
            var guideSeq = guideSheetObj.getGuidesheetSeqNbr();
            logDebug("Hitting guidesheet number:" + guideSeq);
            var guideBiz = aa.proxyInvoker.newInstance("com.accela.aa.inspection.guidesheet.GGuideSheetBusiness").getOutput();
            guideBiz.removeGGuideSheet("SUFFOLKCO", guideSeq, "ADMIN");
            continue;
        }
    }
    else
    {
        logDebug("no guidesheets here, somehow...");
    }

    //defining our empty item list
    var itemList = aa.util.newArrayList();
    //getting inspection on the current record
    var inspectionResult = aa.inspection.getInspections(capId);
    if (inspectionResult.getSuccess())
    {
        //putting those inspections into an array
        var insArray = inspectionResult.getOutput();
        //targeting the most recent previous inspection (not the one currently being scheduled)
        var prevInsp = insArray[insArray.length - 1].getInspection();
        //pulling previous inspection's guidesheets
        var prevGs = prevInsp.getGuideSheets();

        if (prevGs != null)
        {
            //passing those guidesheets to an array
            var prevGsArray = prevGs.toArray();
            //adding each item from the array into itemList
            for (gs in prevGsArray)
            {
                itemList.add(prevGsArray[gs]);
            }
            //copy in the stuff from itemList into the new inspection
            var copyItems = aa.guidesheet.copyGGuideSheetItems(itemList, capId, inspId, currentUserID);
            if (copyItems.getSuccess())
            {
                logDebug("Copied guidesheet successfully.");
            }
        }
    }
    else
    {
        logDebug("**ERROR: Failed to copy: " + res.getErrorMessage());
    }
}