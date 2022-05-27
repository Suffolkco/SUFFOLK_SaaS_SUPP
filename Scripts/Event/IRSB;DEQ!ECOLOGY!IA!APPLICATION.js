if (currentUserID == "RLITTLEFIELD")
{
    //cancel = true;
    //showDebug = true;
}
if (inspResult == "Lab Results Returned")
{
    var stopMessage = "";
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
                    //logDebug("guidesheet name is: " + vGuideSheetArray[x].getGuideType());
                    if (vGuideSheetArray[x].getGuideType() == "I/A OWTS Sample")
                    {
                        vGuideSheet = vGuideSheetArray[x];
                        //logDebug("vguidesheet is: " + vGuideSheet)
                        if (vGuideSheet.getItems() != null)
                        {
                            vGuideSheetItemsArray = vGuideSheet.getItems().toArray();
                            for (z in vGuideSheetItemsArray)
                            {
                                //logDebug("we're in the guidesheetitemsarray");
                                vGuideSheetItem = vGuideSheetItemsArray[z];
                                //logDebug("vguidesheetitem is: " + vGuideSheetItem.getGuideItemText());
                                if (vGuideSheetItem.getGuideItemText() == "Sample Collection")
                                {
                                    var ASISubGroups = vGuideSheetItemsArray[z].getItemASISubgroupList();
                                    if (ASISubGroups)
                                    {
                                        for (var k = 0; k < ASISubGroups.size(); k++)
                                        {
                                            var ASISubGroup = ASISubGroups.get(k);
                                            var ASIModels = ASISubGroup.getAsiList();
                                            if (ASIModels)
                                            {
                                                for (var m = 0; m < ASIModels.size(); m++)
                                                {
                                                    var ASIModel = ASIModels.get(m);
                                                    if (ASIModel)
                                                    {
                                                        if (ASIModel.getAsiName() == "Date")
                                                        {
                                                            if (matches(ASIModel.getAttributeValue(), null, "", " ", undefined))
                                                            {
                                                                stopMessage += "You must fill out the Date field in the Sample Collection checklist." + "<br>";
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    var labTable = getGuidesheetItemASIT(vGuideSheet, vGuideSheetItem, "LAB RESULTS AND FIELD DATA");
                                    //logDebug("vguidesheet is: " + vGuideSheet + " and vguidesheetitem is: " + vGuideSheetItem);
                                    //logDebug("labtable is: " + labTable);
                                    if (labTable)
                                    {
                                        for (labEntry in labTable)
                                        {
                                            logDebug("labresults Lab ID entry is: " + labTable[labEntry]["Lab ID"]);
                                            if (matches(labTable[labEntry]["Lab ID"], "", " ", null, undefined))
                                            {
                                                stopMessage += "Lab ID must be filled out in the LAB RESULTS AND FIELD DATA table." + "<br>";
                                            }
                                        }
                                    }

                                    else
                                    {
                                        logDebug("labtable doesn't have length");

                                        stopMessage += "At least one row must be entered into the Lab Results table before the inspection can be resulted." + "<br>";
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
    if (stopMessage != "")
    {
        cancel = true;
        showMessage = true;
        comment(stopMessage);
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
