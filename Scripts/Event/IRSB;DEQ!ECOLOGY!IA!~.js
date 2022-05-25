if (currentUserID == "RLITTLEFIELD")
{
    cancel = true;
    showDebug = true;
}
if (inspResult == "Lab Results Returned")
{
    var gsObjs = getGuideSheetObjects(inspId);
    //Identifying if the inspector wants to schedule a follow-up inspection automatically
    var vInspection = aa.inspection.getInspection(capId, inspId);
    if (vInspection.getSuccess())
    {
        var vInspection = vInspection.getOutput();
        var vInspectionActivity = vInspection.getInspection().getActivity();
        // Get the guidesheets and their items from the activity model
        var guideBiz = aa.proxyInvoker.newInstance("com.accela.aa.inspection.guidesheet.GGuideSheetBusiness").getOutput();
        var vGuideSheetArray = guideBiz.getGGuideSheetWithItemsByInspections("", [vInspectionActivity]).toArray();
        if (vGuideSheetArray.length != 0)
        {
            for (x in vGuideSheetArray)
            {
                vGuideSheet = vGuideSheetArray[x];
                if (vGuideSheet.getItems() != null)
                {
                    vGuideSheetItemsArray = vGuideSheet.getItems().toArray();

                    if (vGuideSheetArray[x].getGuideType() == "I/A OWTS Sample")
                    {
                        vGuideSheet = vGuideSheetArray[x];
                        if (vGuideSheet.getItems() != null)
                        {
                            vGuideSheetItemsArray = vGuideSheet.getItems().toArray();
                            for (z in vGuideSheetItemsArray)
                            {
                                vGuideSheetItem = vGuideSheetItemsArray[z];
                                var labResultsTable = getGuidesheetItemASIT(vGuideSheet, vGuideSheetItem, "LAB RESULTS AND FIELD DATA");
                                if (labResultsTable)
                                {
                                    if (labResultsTable.length < 1)
                                    {
                                        cancel = true;
                                        showMessage = true;
                                        comment("At least one row must be entered into the Lab Results table before the inspection can be resulted.");
                                    }
                                    else
                                    {
                                        for (labEntry in labResultsTable)
                                        {
                                            logDebug("labresults table entry name is: " + labResultsTable[labEntry]);
                                            if (labResultsTable[labEntry] == "Lab ID")
                                            {
                                                logDebug("found labid!");
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        else
        {
            logDebug("Failed to get guidesheets");
        }
    }
    else
    {
        logDebug("Failed to get inpection");
    }
}
function getGuidesheetItemASIT(guideSheetModel, itemModel, tableName) {
    var gso = new guideSheetObject(guideSheetModel, itemModel);
    gso.loadInfoTables();
    if (gso.validTables && gso.infoTables)
    {
        for (tbl in gso.infoTables)
        {
            if (tbl.toUpperCase().equals(tableName.toUpperCase()) && gso.infoTables[tbl].length > 0)
            {
                return gso.infoTables[tbl];
            }
        }
    }
    return null;
}
