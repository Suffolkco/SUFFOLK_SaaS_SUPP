
var vInspection = aa.inspection.getInspection(capId, inspId);
if (vInspection.getSuccess())
{
    var vInspection = vInspection.getOutput();
    var vInspectionActivity = vInspection.getInspection().getActivity();
    // Get the guidesheets and their items from the activity model
    var guideBiz = aa.proxyInvoker.newInstance("com.accela.aa.inspection.guidesheet.GGuideSheetBusiness").getOutput();
    var vGuideSheetArray = guideBiz.getGGuideSheetWithItemsByInspections("", [vInspectionActivity]).toArray();

    //Inspection Type of Experimental Composite

    if (inspType == "Experimental Composite")
    {
        if (vGuideSheetArray.length != 0)
        {
            var x = 0;
            for (x in vGuideSheetArray)
            {
                var iaLab = null
                var vGuideSheet = vGuideSheetArray[x];
                if ("I/A OWTS Sample".toUpperCase() == vGuideSheet.getGuideType().toUpperCase() && vGuideSheet.getItems() != null)
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
                                                    ASIModel.setAttributeValue("Pace");
                                                    var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                                    if (updateResult.getSuccess())
                                                    {
                                                        logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                                    } else
                                                    {
                                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                                                    }

                                                }

                                            }
                                            if (ASIModel.getAsiName() == "Process")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "Scheduling Information")
                                                {
                                                    ASIModel.setAttributeValue("Final Effleunt");
                                                    var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                                    if (updateResult.getSuccess())
                                                    {
                                                        logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                                    } else
                                                    {
                                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                                                    }
                                                }

                                            }
                                            if (ASIModel.getAsiName() == "Phase")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "Scheduling Information")
                                                {
                                                    ASIModel.setAttributeValue("Experimental");
                                                    var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                                    if (updateResult.getSuccess())
                                                    {
                                                        logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                                    } else
                                                    {
                                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                                                    }
                                                }

                                            } 
                                            if (ASIModel.getAsiName() == "Collection")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "Scheduling Information")
                                                {
                                                    ASIModel.setAttributeValue("Composite (24hr)");
                                                    var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                                    if (updateResult.getSuccess())
                                                    {
                                                        logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                                    } else
                                                    {
                                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                                                    }

                                                }
                                            }
                                            if (ASIModel.getAsiName() == "Collector")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "Scheduling Information")
                                                {
                                                    ASIModel.setAttributeValue("SCDHS");
                                                    var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                                    if (updateResult.getSuccess())
                                                    {
                                                        logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                                    } else
                                                    {
                                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
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

    //Inspection Type of Experimental Grab

    if (inspType == "Experimental Grab")
    {
        if (vGuideSheetArray.length != 0)
        {
            var x = 0;
            for (x in vGuideSheetArray)
            {
                var iaLab = null
                var vGuideSheet = vGuideSheetArray[x];
                if ("I/A OWTS Sample".toUpperCase() == vGuideSheet.getGuideType().toUpperCase() && vGuideSheet.getItems() != null)
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
                                                    ASIModel.setAttributeValue("Pace");
                                                    var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                                    if (updateResult.getSuccess())
                                                    {
                                                        logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                                    } else
                                                    {
                                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                                                    }

                                                }

                                            }
                                            if (ASIModel.getAsiName() == "Process")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "Scheduling Information")
                                                {
                                                    ASIModel.setAttributeValue("Final Effleunt");
                                                    var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                                    if (updateResult.getSuccess())
                                                    {
                                                        logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                                    } else
                                                    {
                                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                                                    }
                                                }

                                            }
                                            if (ASIModel.getAsiName() == "Phase")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "Scheduling Information")
                                                {
                                                    ASIModel.setAttributeValue("Experimental");
                                                    var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                                    if (updateResult.getSuccess())
                                                    {
                                                        logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                                    } else
                                                    {
                                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                                                    }
                                                }

                                            } 
                                            if (ASIModel.getAsiName() == "Collection")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "Scheduling Information")
                                                {
                                                    ASIModel.setAttributeValue("Grab");
                                                    var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                                    if (updateResult.getSuccess())
                                                    {
                                                        logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                                    } else
                                                    {
                                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                                                    }

                                                }
                                            }
                                            if (ASIModel.getAsiName() == "Collector")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "Scheduling Information")
                                                {
                                                    ASIModel.setAttributeValue("SCDHS");
                                                    var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                                    if (updateResult.getSuccess())
                                                    {
                                                        logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                                    } else
                                                    {
                                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
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

    //Inspection Type of Piolot Composite

    if (inspType == "Pilot Composite")
    {
        if (vGuideSheetArray.length != 0)
        {
            var x = 0;
            for (x in vGuideSheetArray)
            {
                var iaLab = null
                var vGuideSheet = vGuideSheetArray[x];
                if ("I/A OWTS Sample".toUpperCase() == vGuideSheet.getGuideType().toUpperCase() && vGuideSheet.getItems() != null)
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
                                                    ASIModel.setAttributeValue("Pace");
                                                    var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                                    if (updateResult.getSuccess())
                                                    {
                                                        logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                                    } else
                                                    {
                                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                                                    }

                                                }

                                            }
                                            if (ASIModel.getAsiName() == "Process")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "Scheduling Information")
                                                {
                                                    ASIModel.setAttributeValue("Final Effleunt");
                                                    var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                                    if (updateResult.getSuccess())
                                                    {
                                                        logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                                    } else
                                                    {
                                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                                                    }
                                                }

                                            }
                                            if (ASIModel.getAsiName() == "Phase")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "Scheduling Information")
                                                {
                                                    ASIModel.setAttributeValue("Pilot");
                                                    var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                                    if (updateResult.getSuccess())
                                                    {
                                                        logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                                    } else
                                                    {
                                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                                                    }
                                                }

                                            } 
                                            if (ASIModel.getAsiName() == "Collection")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "Scheduling Information")
                                                {
                                                    ASIModel.setAttributeValue("Composite (24hr)");
                                                    var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                                    if (updateResult.getSuccess())
                                                    {
                                                        logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                                    } else
                                                    {
                                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                                                    }

                                                }
                                            }
                                            if (ASIModel.getAsiName() == "Collector")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "Scheduling Information")
                                                {
                                                    ASIModel.setAttributeValue("SCDHS");
                                                    var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                                    if (updateResult.getSuccess())
                                                    {
                                                        logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                                    } else
                                                    {
                                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
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

    // Inspection Type of Pilot Grab

    if (inspType == "Pilot Grab")
    {
        if (vGuideSheetArray.length != 0)
        {
            var x = 0;
            for (x in vGuideSheetArray)
            {
                var iaLab = null
                var vGuideSheet = vGuideSheetArray[x];
                if ("I/A OWTS Sample".toUpperCase() == vGuideSheet.getGuideType().toUpperCase() && vGuideSheet.getItems() != null)
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
                                                    ASIModel.setAttributeValue("Pace");
                                                    var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                                    if (updateResult.getSuccess())
                                                    {
                                                        logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                                    } else
                                                    {
                                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                                                    }

                                                }

                                            }
                                            if (ASIModel.getAsiName() == "Process")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "Scheduling Information")
                                                {
                                                    ASIModel.setAttributeValue("Final Effleunt");
                                                    var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                                    if (updateResult.getSuccess())
                                                    {
                                                        logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                                    } else
                                                    {
                                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                                                    }
                                                }

                                            }
                                            if (ASIModel.getAsiName() == "Phase")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "Scheduling Information")
                                                {
                                                    ASIModel.setAttributeValue("Pilot");
                                                    var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                                    if (updateResult.getSuccess())
                                                    {
                                                        logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                                    } else
                                                    {
                                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                                                    }
                                                }

                                            } 
                                            if (ASIModel.getAsiName() == "Collection")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "Scheduling Information")
                                                {
                                                    ASIModel.setAttributeValue("Grab");
                                                    var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                                    if (updateResult.getSuccess())
                                                    {
                                                        logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                                    } else
                                                    {
                                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                                                    }

                                                }
                                            }
                                            if (ASIModel.getAsiName() == "Collector")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "Scheduling Information")
                                                {
                                                    ASIModel.setAttributeValue("SCDHS");
                                                    var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                                    if (updateResult.getSuccess())
                                                    {
                                                        logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                                    } else
                                                    {
                                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
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
    
    // Inspection type of QAQC 1

    if (inspType == "QAQC 1")
    {
        if (vGuideSheetArray.length != 0)
        {
            var x = 0;
            for (x in vGuideSheetArray)
            {
                var iaLab = null
                var vGuideSheet = vGuideSheetArray[x];
                if ("I/A OWTS Sample".toUpperCase() == vGuideSheet.getGuideType().toUpperCase() && vGuideSheet.getItems() != null)
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
                                                    ASIModel.setAttributeValue("Pace");
                                                    var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                                    if (updateResult.getSuccess())
                                                    {
                                                        logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                                    } else
                                                    {
                                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                                                    }

                                                }

                                            }
                                            if (ASIModel.getAsiName() == "Process")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "Scheduling Information")
                                                {
                                                    ASIModel.setAttributeValue("Final Effleunt");
                                                    var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                                    if (updateResult.getSuccess())
                                                    {
                                                        logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                                    } else
                                                    {
                                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                                                    }
                                                }

                                            }
                                            if (ASIModel.getAsiName() == "Phase")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "Scheduling Information")
                                                {
                                                    ASIModel.setAttributeValue("QAQC 1");
                                                    var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                                    if (updateResult.getSuccess())
                                                    {
                                                        logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                                    } else
                                                    {
                                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                                                    }
                                                }

                                            } 
                                            if (ASIModel.getAsiName() == "Collection")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "Scheduling Information")
                                                {
                                                    ASIModel.setAttributeValue("Grab");
                                                    var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                                    if (updateResult.getSuccess())
                                                    {
                                                        logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                                    } else
                                                    {
                                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                                                    }

                                                }
                                            }
                                            if (ASIModel.getAsiName() == "Collector")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "Scheduling Information")
                                                {
                                                    ASIModel.setAttributeValue("SCDHS");
                                                    var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                                    if (updateResult.getSuccess())
                                                    {
                                                        logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                                    } else
                                                    {
                                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
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

    // Inspection Type of QAQC 2

    if (inspType == "QAQC 2")
    {
        if (vGuideSheetArray.length != 0)
        {
            var x = 0;
            for (x in vGuideSheetArray)
            {
                var iaLab = null
                var vGuideSheet = vGuideSheetArray[x];
                if ("I/A OWTS Sample".toUpperCase() == vGuideSheet.getGuideType().toUpperCase() && vGuideSheet.getItems() != null)
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
                                                    ASIModel.setAttributeValue("PEHL");
                                                    var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                                    if (updateResult.getSuccess())
                                                    {
                                                        logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                                    } else
                                                    {
                                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                                                    }

                                                }

                                            }
                                            if (ASIModel.getAsiName() == "Process")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "Scheduling Information")
                                                {
                                                    ASIModel.setAttributeValue("Final Effleunt");
                                                    var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                                    if (updateResult.getSuccess())
                                                    {
                                                        logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                                    } else
                                                    {
                                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                                                    }
                                                }

                                            }
                                            if (ASIModel.getAsiName() == "Phase")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "Scheduling Information")
                                                {
                                                    ASIModel.setAttributeValue("QAQC 2");
                                                    var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                                    if (updateResult.getSuccess())
                                                    {
                                                        logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                                    } else
                                                    {
                                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                                                    }
                                                }

                                            } 
                                            if (ASIModel.getAsiName() == "Collection")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "Scheduling Information")
                                                {
                                                    ASIModel.setAttributeValue("Grab");
                                                    var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                                    if (updateResult.getSuccess())
                                                    {
                                                        logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                                    } else
                                                    {
                                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                                                    }

                                                }
                                            }
                                            if (ASIModel.getAsiName() == "Collector")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "Scheduling Information")
                                                {
                                                    ASIModel.setAttributeValue("SCDHS");
                                                    var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                                    if (updateResult.getSuccess())
                                                    {
                                                        logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                                    } else
                                                    {
                                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
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

    //Inspection Type of QAQC Split Sample
    if (inspType == "QAQC Split Sample")
    {
        if (vGuideSheetArray.length != 0)
        {
            var x = 0;
            for (x in vGuideSheetArray)
            {
                var iaLab = null
                var vGuideSheet = vGuideSheetArray[x];
                if ("I/A OWTS Sample".toUpperCase() == vGuideSheet.getGuideType().toUpperCase() && vGuideSheet.getItems() != null)
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
                                                    ASIModel.setAttributeValue("PEHL");
                                                    var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                                    if (updateResult.getSuccess())
                                                    {
                                                        logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                                    } else
                                                    {
                                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                                                    }

                                                }

                                            }
                                            if (ASIModel.getAsiName() == "Process")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "Scheduling Information")
                                                {
                                                    ASIModel.setAttributeValue("Final Effleunt");
                                                    var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                                    if (updateResult.getSuccess())
                                                    {
                                                        logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                                    } else
                                                    {
                                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                                                    }
                                                }

                                            }
                                            if (ASIModel.getAsiName() == "Phase")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "Scheduling Information")
                                                {
                                                    ASIModel.setAttributeValue("Split Sample");
                                                    var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                                    if (updateResult.getSuccess())
                                                    {
                                                        logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                                    } else
                                                    {
                                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                                                    }
                                                }

                                            } 
                                            if (ASIModel.getAsiName() == "Collection")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "Scheduling Information")
                                                {
                                                    ASIModel.setAttributeValue("Grab");
                                                    var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                                    if (updateResult.getSuccess())
                                                    {
                                                        logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                                    } else
                                                    {
                                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                                                    }

                                                }
                                            }
                                            if (ASIModel.getAsiName() == "Collector")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "Scheduling Information")
                                                {
                                                    ASIModel.setAttributeValue("SCDHS");
                                                    var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                                                    if (updateResult.getSuccess())
                                                    {
                                                        logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                                                    } else
                                                    {
                                                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
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

