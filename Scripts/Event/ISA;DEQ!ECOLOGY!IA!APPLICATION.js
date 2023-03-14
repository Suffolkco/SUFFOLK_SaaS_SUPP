
var vInspectionInsp = aa.inspection.getInspection(capId, inspId);
if (vInspectionInsp.getSuccess())
{
    var vInspection = vInspectionInsp.getOutput();
    var vInspectionActivity = vInspection.getInspection().getActivity();
    // Get the guidesheets and their items from the activity model
    var guideBiz = aa.proxyInvoker.newInstance("com.accela.aa.inspection.guidesheet.GGuideSheetBusiness").getOutput();
    var vGuideSheetArray = guideBiz.getGGuideSheetWithItemsByInspections("", [vInspectionActivity]).toArray();

    editAppSpecific("Most Recent SCDH Request", inspSchedDate, capId);
    //Inspection Type of Experimental Composite

    logDebug("**** Inspection Type; " + vInspection.getInspectionType() + ", Inspection Status: " + vInspection.getInspectionStatus());
    logDebug("request comment is " + vInspection.getInspection().getRequestComment());
    if (String(vInspection.getInspection().getRequestComment()).indexOf("NOEMAIL") == -1)
    {
        var conEmail = "";
        var contactResult = aa.people.getCapContactByCapID(capId);
        if (contactResult.getSuccess())
        {
            var capContacts = contactResult.getOutput();
            for (c in capContacts)
            {
                if (!matches(capContacts[c].email, null, undefined, ""))
                {
                    if (capContacts[c].getPeople().getAuditStatus() == "A")
                    {
                        if (matches(capContacts[c].getCapContactModel().getContactType(), "Property Owner", "Agent"))
                        {
                            conEmail += String(capContacts[c].email) + ";";
                        }
                    }
                }
            }
        }
        logDebug("didn't find NOEMAIL in the request comment! gonna send an email");
        var addressInALine = getAddressInALine(capId);
        var vEParams = aa.util.newHashtable();
        var schedDate = vInspection.getInspection().getScheduledDate();
        logDebug("sched date is: " + schedDate);
        var schedDateConverted = convertDate(schedDate);
        var newSchedDateFormatted = (schedDateConverted.getMonth() + 2) + "/" + schedDateConverted.getDate() + "/" + (schedDateConverted.getFullYear() + 1900);
        logDebug("newSchedDateFormatted is: " + newSchedDateFormatted);

        addParameter(vEParams, "$$inspSchedDate$$", newSchedDateFormatted);
        addParameter(vEParams, "$$addressInALine$$", addressInALine);

        sendNotification("", conEmail, "", "DEQ_IA_ROUTINE_SEPTIC_SYSTEM_SAMPLING", vEParams, null);

    }


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

function getAddressInALine(capId) {

    var capAddrResult = aa.address.getAddressByCapId(capId);
    var addressToUse = null;
    var strAddress = "";

    if (capAddrResult.getSuccess())
    {
        var addresses = capAddrResult.getOutput();
        if (addresses)
        {
            for (zz in addresses)
            {
                capAddress = addresses[zz];
                if (capAddress.getPrimaryFlag() && capAddress.getPrimaryFlag().equals("Y"))
                    addressToUse = capAddress;
            }
            if (addressToUse == null)
                addressToUse = addresses[0];

            if (addressToUse)
            {
                strAddress = addressToUse.getHouseNumberStart();
                var addPart = addressToUse.getStreetDirection();
                if (addPart && addPart != "")
                    strAddress += " " + addPart;
                var addPart = addressToUse.getStreetName();
                if (addPart && addPart != "")
                    strAddress += " " + addPart;
                var addPart = addressToUse.getStreetSuffix();
                if (addPart && addPart != "")
                    strAddress += " " + addPart;
                var addPart = addressToUse.getCity();
                if (addPart && addPart != "")
                    strAddress += " " + addPart + ",";
                var addPart = addressToUse.getState();
                if (addPart && addPart != "")
                    strAddress += " " + addPart;
                var addPart = addressToUse.getZip();
                if (addPart && addPart != "")
                    strAddress += " " + addPart;
                return strAddress
            }
        }
    }
    return null;
}

function getDateMMDDYYYY(inputDate) {
    var yyyy = inputDate.getFullYear().toString();
    var mm = (inputDate.getMonth() + 1).toString();
    if (mm.length < 2)
    {
        mm = "0" + mm;
    }

    var dd = (inputDate.getDate().toString());
    if (dd.length < 2)
    {
        dd = "0" + dd;
    }
    return mm + "/" + dd + "/" + yyyy;
}