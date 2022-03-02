if (inspType == "Lab Results" && inspResult == "Complete")
{
var doValue = getGuidesheetASIField(pInspId, "Lab Results", "IA Lab Results", "DEQ_IA_LAB", "FIELD RESULTS", "DO");
var phValue = getGuidesheetASIField(pInspId, "Lab Results", "IA Lab Results", "DEQ_IA_LAB", "FIELD RESULTS", "PH");
var wwTemp = getGuidesheetASIField(pInspId, "Lab Results", "IA Lab Results", "DEQ_IA_LAB", "FIELD RESULTS", "WW TEMP");
var airTemp = getGuidesheetASIField(pInspId, "Lab Results", "IA Lab Results", "DEQ_IA_LAB", "FIELD RESULTS", "Air Temp");

var insp = aa.inspection.getInspection(capId, inspId).getOutput();
var vInspectionActivity = insp.getInspection().getActivity();

var guideBiz = aa.proxyInvoker.newInstance("com.accela.aa.inspection.guidesheet.GGuideSheetBusiness").getOutput();
        var vGuideSheetArray = guideBiz.getGGuideSheetWithItemsByInspections("", [vInspectionActivity]).toArray();
        if (vGuideSheetArray.length != 0)
        {
            var x = 0;
            for (x in vGuideSheetArray)
            {
                var vGuideSheet = vGuideSheetArray[x];
                if ("IA Lab Results".toUpperCase() == vGuideSheet.getGuideType().toUpperCase() && vGuideSheet.getItems() != null)
                {
                    vGuideSheetItemsArray = vGuideSheet.getItems().toArray();
                    var z = 0;
                    for (z in vGuideSheetItemsArray)
                    {
                        var vGuideSheetItem = vGuideSheetItemsArray[z];
                        if (vGuideSheetItem && "IA Lab Results" == vGuideSheetItem.getGuideItemText())
                        {
                            var labResultsTable = getGuidesheetItemASIT(vGuideSheet, vGuideSheetItem, "LAB RESULTS");
                            var newLabResultsTable = new Array();
                            for (var l in labResultsTable)
                            {
                                var newRow = new Array();
                                newRow["Lab ID"] = labResultsTable[l]["Lab ID"];
                                newRow["TN"] = labResultsTable[l]["TN"];
                                newRow["NO3 Nitrate"] = labResultsTable[l]["NO3 Nitrate"];
                                newRow["NO2 Nitrate"] = labResultsTable[l]["NO2 Nitrate"];
                                newRow["TKN"] = labResultsTable[l]["TKN"];
                                newRow["NH4 Ammonia"] = labResultsTable[l]["NH4 Ammonia"];
                                newRow["BOD"] = labResultsTable[l]["BOD"];
                                newRow["TSS"] = labResultsTable[l]["TSS"];
                                newRow["ALK"] = labResultsTable[l]["ALK"];
                                newRow["DO"] = doValue;
                                newRow["PH"] = phValue;
                                newRow["WW Temp"] = wwTemp;
                                newRow["Air Temp"] = airTemp;

                                newLabResultsTable.push(newRow);
                            }
                            addASITable("LAB RESULTS", newLabResultsTable, capId);
                        }
                    }
                }
            }
        }
    }
    function getGuidesheetASIField(pInspId, gName, gItem, asiGroup, asiSubGroup, asiLabel)
{
    var vInspId = parseFloat(pInspId);
    var vInspectionActivity;
    var asiValue = "";
    var guideBiz;
    var vGuideSheetArray = [];
    var vGuideSheet;
    var vGuideSheetItemsArray = [];
    var vGuideSheetItem;
    var vInspection;

    // Get the specific inspection model
    vInspection = aa.inspection.getInspection(capId, vInspId);
    if (vInspection.getSuccess())
    {
        vInspection = vInspection.getOutput();
        vInspectionActivity = vInspection.getInspection().getActivity();

        // Get the guidesheets and their items from the activity model
        guideBiz = aa.proxyInvoker.newInstance("com.accela.aa.inspection.guidesheet.GGuideSheetBusiness").getOutput();
        vGuideSheetArray = guideBiz.getGGuideSheetWithItemsByInspections("", [vInspectionActivity]).toArray();
        if (vGuideSheetArray.length != 0)
        {
            var x = 0;
            for (x in vGuideSheetArray)
            {
                vGuideSheet = vGuideSheetArray[x];
                if (gName.toUpperCase() == vGuideSheet.getGuideType().toUpperCase() && vGuideSheet.getItems() != null)
                {
                    vGuideSheetItemsArray = vGuideSheet.getItems().toArray();
                    var z = 0;
                    for (z in vGuideSheetItemsArray)
                    {
                        vGuideSheetItem = vGuideSheetItemsArray[z];
                        if (vGuideSheetItem && gItem == vGuideSheetItem.getGuideItemText() && asiGroup == vGuideSheetItem.getGuideItemASIGroupName())
                        {
                            var ASISubGroups = vGuideSheetItem.getItemASISubgroupList();
                            if (ASISubGroups)
                            {
                                for (var k = 0; k < ASISubGroups.size(); k++)
                                {
                                    var ASISubGroup = ASISubGroups.get(k);
                                    if (ASISubGroup && ASISubGroup.getSubgroupCode() == asiSubGroup)
                                    {
                                        var ASIModels = ASISubGroup.getAsiList();
                                        if (ASIModels)
                                        {
                                            for (var m = 0; m < ASIModels.size(); m++)
                                            {
                                                var ASIModel = ASIModels.get(m);
                                                if (ASIModel && ASIModel.getAsiName() == asiLabel)
                                                {
                                                    logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                    asiValue = ASIModel.getAttributeValue();
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else
                {
                    logDebug("Failed to get guide sheet item");
                }
            }
        } else
        {
            logDebug("Failed to get guidesheets");
        }
    } else
    {
        logDebug("Failed to get inpection");
    }
    return asiValue;
}