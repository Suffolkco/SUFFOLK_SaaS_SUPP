// IRSB;DEQ!~!~!~
showDebug = false;
var gsObjs = getGuideSheetObjects(inspId);
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
                if (vGuideSheetArray[x].getGuideType() == "Marine Resources")
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
                            //if (vGuideSheetItem.getGuideItemText() == "Field Inspection Time")
                            {
                                var ASISubGroups = vGuideSheetItem.getItemASISubgroupList();
                               // logDebug("ASISubGroups: " + ASISubGroups);
                              
                                if (ASISubGroups)
                                {
                                    //logDebug("ASISubGroups.size(): " + ASISubGroups.size());
                                    for (var k = 0; k < ASISubGroups.size(); k++)
                                    {
                                        var ASISubGroup = ASISubGroups.get(k);
                                        var ASIModels = ASISubGroup.getAsiList();
                                        if (ASIModels)
                                        {
                                            // logDebug("ASIModels.size(): " + ASIModels.size());
                                            for (var m = 0; m < ASIModels.size(); m++)
                                            {
                                                var ASIModel = ASIModels.get(m);                                               			
                                                var asiValue = ASIModel.getAttributeValue();		

                                                if (ASIModel)
                                                {
                                                    // logDebug("ASIModel.getAsiName(): " + ASIModel.getAsiName());
                                                    if (ASIModel.getAsiName() == "Field Inspection Time")
                                                    {
                                                        //logDebug("ASIModel.getAttributeValue(): " + ASIModel.getAttributeValue());
                                                        if (!matches(ASIModel.getAttributeValue(), null, "", " ", undefined))
                                                        {
                                                            if (!asiValue.contains(':'))
                                                                {
                                                                    cancel = true;
                                                                    showMessage = true;
                                                                    comment("Field Inspection Time field must contain colon :");
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
            }
        }
    }



