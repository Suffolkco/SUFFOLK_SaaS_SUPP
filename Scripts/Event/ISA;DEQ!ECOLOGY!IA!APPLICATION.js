
var vInspection = aa.inspection.getInspection(capId, inspId);
if (vInspection.getSuccess())
{
    var vInspection = vInspection.getOutput();
    var vInspectionActivity = vInspection.getInspection().getActivity();
    // Get the guidesheets and their items from the activity model
    var guideBiz = aa.proxyInvoker.newInstance("com.accela.aa.inspection.guidesheet.GGuideSheetBusiness").getOutput();
    var vGuideSheetArray = guideBiz.getGGuideSheetWithItemsByInspections("", [vInspectionActivity]).toArray();
    if (inspType == "Lab Results")
    {
        if (vGuideSheetArray.length != 0)
        {
            var x = 0;
            for (x in vGuideSheetArray)
            {
                var iaLab = null
                if ("IA Lab Results".toUpperCase() == vGuideSheet.getGuideType().toUpperCase() && vGuideSheet.getItems() != null)
                {
                    var vGuideSheetItemsArray = vGuideSheet.getItems().toArray();
                    var z = 0;
                    for (z in vGuideSheetItemsArray)
                    {
                        var vGuideSheetItem = vGuideSheetItemsArray[z];
                        var ASISubGroups = vGuideSheetItem.getItemASISubgroupList();
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
                                            if (ASIModel.getAsiName() == "Lab")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "Scheduling Information")
                                                {
                                                    ASIModel.setAttributeValue("Pace")
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
        }
    }
}
