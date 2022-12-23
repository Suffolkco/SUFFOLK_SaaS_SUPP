//IRSA:DEQ/~/~/~

showDebug = true;


var insYear = inspObj.getInspectionStatusDate().getYear().toString();
var insMonth = inspObj.getInspectionStatusDate().getMonth().toString();
var insDay = inspObj.getInspectionStatusDate().getDayOfMonth().toString();
var inspSchedDate = inspObj.getScheduledDate().getMonth() + "/" + inspObj.getScheduledDate().getDayOfMonth() + "/" + inspObj.getScheduledDate().getYear();
var inspSchedDatePlusOne = inspObj.getScheduledDate().getMonth() + "/" + inspObj.getScheduledDate().getDayOfMonth() + "/" + (inspObj.getScheduledDate().getYear() + 1);
var inspSchedDatePlusThree = inspObj.getScheduledDate().getMonth() + "/" + inspObj.getScheduledDate().getDayOfMonth() + "/" + (inspObj.getScheduledDate().getYear() + 3);

if (insMonth.length == 1)
{
    insMonth = "0" + insMonth;
}
if (insDay.length == 1)
{
    insDay = "0" + insDay;
}

var insCon = insMonth + "/" + insDay + "/" + insYear;
var insConSampleDate = insMonth + "/" + insDay + "/" + (inspObj.getInspectionStatusDate().getYear() + 3);
var insConServiceDate = insMonth + "/" + insDay + "/" + (inspObj.getInspectionStatusDate().getYear() + 1);

if (inspType == "Sampling Event" && inspResult == "Sent to Lab")
{
    insId = inspObj.getIdNumber();
    var rParams = aa.util.newHashMap();
    var rFile = new Array();
    rParams.put("INSP_SEQ_NO", insId.toString());
    rParams.put("BLANK", insCon);
    //logDebug("Params are: " + rParams);// 
    // Old report
    //rFile = reportRunSave("Analysis_Request_Form_by_Insp_Seq_No", true, false, true, "General", rParams);
    // New report
    rFile = reportRunSave("603_Sample_Submission_Form_New", true, false, true, "General", rParams);

}

// EHIMS-4697: OPC Dry Cleaners Inspection only
if (inspType == "OPC Dry Cleaner Inspection" && (inspResult == "Complete" || inspResult == "Incomplete"))
{
    logDebug(inspType + ", " + inspResult);
    var inspResultObj = aa.inspection.getInspections(capId);

    if (inspResultObj.getSuccess())
    {
        logDebug("Success? " + inspResultObj.getSuccess());

        var inspList = inspResultObj.getOutput();

        logDebug("inspList.length? " + inspList.length);

        if (inspList && inspList.length > 0)
        {
            for (var xx in inspList)
            {                
                logDebug("inspList.length? " + inspList[xx].getInspection().getIdNumber());
                
                if (inspList[xx].getInspection().getIdNumber() == inspId)
                {
                    if (inspList[xx].getInspectionType().toUpperCase().contains("OPC Dry Cleaner Inspection") &&
                        (inspList[xx].getInspectionStatus() == "Completed" || inspList[xx].getInspectionStatus() == "Incomplete"))
                    {
                        inspObj = inspList[xx];
                        logDebug("Inspection number: " + inspList[xx].getInspection().getIdNumber());
                        logDebug("Inspection type: " + inspList[xx].getInspectionType());
                        logDebug("Inspection Status: " + inspList[xx].getInspectionStatus());

                    }
                }
            }
        }
    }
    if (!inspObj)
    {
        logDebug("No inspection found to update");
    }
    else
    {
        inspModel = inspObj.getInspection();
        gsList = inspModel.getGuideSheets();
        logDebug(inspModel);
        if (gsList)
        {
            logDebug(gsList);

            gsArr = gsList.toArray();
            for (gsi in gsArr)
            {
                logDebug(gsArr);
                gs = gsArr[gsi];
                gsItemList = gs.getItems();
                if (gsItemList)
                {
                    gsItemArr = gsItemList.toArray();
                    for (gsii in gsItemArr)
                    {
                        gsItem = gsItemArr[gsii];
                        logDebug("gsItem.getGuideItemText() : " + gsItem.getGuideItemText());
                        logDebug("gsItem.getGuideItemASIGroupName()" + gsItem.getGuideItemASIGroupName());
                        logDebug("gsItem.getGuideItemStatus() : " + gsItem.getGuideItemStatus());
                        logDebug("getGuideItemScore(): " + gsItem.getGuideItemScore());
                        logDebug("gguidesheetItemModel.getGuideItemComment(): " + gsItem.getGuideItemComment());
                        logDebug("gsItem.getGuideType(): " + gsItem.getGuideType());
                        
                        checklistStatus = gsItem.getGuideItemStatus();
                        stanardComment = gsItem.getGuideItemComment()
                        logDebug("checklistStatus: " + checklistStatus);
                        logDebug("stanardComment: " + stanardComment);

                        if (gsItem.getGuideItemText().toUpperCase().contains("Is required County Signage posted?"))
                        {
                            editAppSpecific("Signage 'County'", checklistStatus, capId);
                        }
                        else if (gsItem.getGuideItemText().toUpperCase().contains("Was there any Organic signage noted?"))
                        {
                            editAppSpecific("Signage 'Organic'", checklistStatus, capId);
                        }  
                        else if (gsItem.getGuideItemText().toUpperCase().contains("the facility using Process Perc?"))
                        {
                            editAppSpecific("Process 'Perc'", checklistStatus, capId);
                        }  
                        else if (gsItem.getGuideItemText().toUpperCase().contains("Is the facility using Process Hydrocarbon?"))
                        {
                            editAppSpecific("Process 'Hydrocarbon'", checklistStatus, capId);
                        }  
                        else if (gsItem.getGuideItemText().toUpperCase().contains("Is the facility using Process Drop?"))
                        {
                            editAppSpecific("Process 'Drop'", checklistStatus, capId);
                        }  
                        else if (gsItem.getGuideItemText().toUpperCase().contains("Is the facility using Process Wet Clean?"))
                        {
                            editAppSpecific("Process 'Wet Clean'", checklistStatus, capId);
                        }  
                        else if (gsItem.getGuideItemText().toUpperCase().contains("Is the facility using Other Processes?"))
                        {
                            if (checklistStatus == 'Y') // also copy comments
                            {
                                editAppSpecific("Other Process Type", stanardComment, capId);
                            }
                            editAppSpecific("Process Other", checklistStatus, capId);
                        }  
                        else if (gsItem.getGuideItemText().toUpperCase().contains("Is the facility using any Washing Machine(s)?"))
                        {
                            editAppSpecific("Signage 'Organic'", checklistStatus, capId);
                        }  
                        else if (gsItem.getGuideItemText().toUpperCase().contains("Are there any Floor Drains present at the facility?"))
                        {
                            editAppSpecific("Signage 'Organic'", checklistStatus, capId);
                        }  
                        else if (gsItem.getGuideItemText().toUpperCase().contains("Are spotting agents being used?"))
                        {
                            if (checklistStatus == 'Y') // also copy comments
                            {                            
                                editAppSpecific("Spotting Agent(s)", stanardComment, capId);
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
    // For OPC PBS/Non-PBS Site Inspection Types
    // Inspection Group: DEQ OPC Site
    /*OPC Non-PBS Site OP Inspection
    OPC Non-PBS Site Other Inspection
    OPC Non-PBS Site Re-Inspection
    OPC PBS Site GSR Inspection
    OPC PBS Site OP Inspection
    OPC PBS Site Other Inspection
    OPC PBS Site Re-Inspection*/
    var test = inspType.toUpperCase();
    logDebug("The upper case is: " + test);
    var inspResultObj = aa.inspection.getInspections(capId);

    if (inspResultObj.getSuccess())
    {
        var inspList = inspResultObj.getOutput();
        if (inspList && inspList.length > 0)
        {
            for (var xx in inspList)
            {
                //  if (String(insp2Check).equals(inspList[xx].getInspectionType()) && inspList[xx].getInspection().getInspSequenceNumber() == inspSeqNum) {
                if (inspList[xx].getInspection().getIdNumber() == inspId)
                {
                    if ((inspList[xx].getInspectionType().toUpperCase().contains("OPC NON-PBS") || inspList[xx].getInspectionType().toUpperCase().toUpperCase().contains("OPC PBS SITE")) &&
                        (inspList[xx].getInspectionStatus() == "Completed" || inspList[xx].getInspectionStatus() == "Fail"))
                    {
                        inspObj = inspList[xx];
                        logDebug("Inspection number: " + inspList[xx].getInspection().getIdNumber());
                        logDebug("Inspection type: " + inspList[xx].getInspectionType());
                        logDebug("Inspection Status: " + inspList[xx].getInspectionStatus());

                    }
                }
            }
        }
    }
    if (!inspObj)
    {
        logDebug("No inspection found to update");
    }
    else
    {
        inspModel = inspObj.getInspection();
        gsList = inspModel.getGuideSheets();
        if (gsList)
        {
            gsArr = gsList.toArray();
            for (gsi in gsArr)
            {
                gs = gsArr[gsi];
                gsItemList = gs.getItems();
                if (gsItemList)
                {
                    gsItemArr = gsItemList.toArray();
                    for (gsii in gsItemArr)
                    {
                        gsItem = gsItemArr[gsii];
                        logDebug("gsItem.getGuideItemText() : " + gsItem.getGuideItemText());
                        
                    
                        if (gsItem.getGuideItemText().toUpperCase().contains("3 (UNREGISTERED TANK)"))
                        {

                            logDebug("gsItem.getGuideItemASIGroupName()" + gsItem.getGuideItemASIGroupName());
                            logDebug("gsItem.getGuideItemStatus() : " + gsItem.getGuideItemStatus());
                            logDebug("getGuideItemScore(): " + gsItem.getGuideItemScore());
                            logDebug("gguidesheetItemModel.getGuideItemComment(): " + gsItem.getGuideItemComment());
                            logDebug("gsItem.getGuideType(): " + gsItem.getGuideType());

                            if (gsItem.getGuideType() == "PBS Inspection Checklist" || gsItem.getGuideType() == "Non-PBS Inspection Checklist") 
                            {
                                logDebug("Guide Type is: " + gsItem.getGuideType());
                                logDebug("ASI Group Name is: " + gsItem.getGuideItemASIGroupName());

                                if (gsItem.getGuideItemASIGroupName() == "PBS_040" || gsItem.getGuideItemASIGroupName() == "NONPBS_010")
                                {
                                    var ASISubGroups = gsItem.getItemASISubgroupList();

                                    logDebug("ASI subroups");

                                    if (ASISubGroups) 
                                    {
                                        logDebug("ASISubGroups.size(): " + ASISubGroups.size());
                                        for (var k = 0; k < ASISubGroups.size(); k++) 
                                        {
                                            var ASISubGroup = ASISubGroups.get(k);
                                            logDebug("ASISubGroup.getSubgroupCode():" + ASISubGroup.getSubgroupCode());

                                            if (ASISubGroup && (ASISubGroup.getSubgroupCode() == "IS THE REGISTRATION INFORMA" ||
                                                ASISubGroup.getSubgroupCode() == "IS THE PERMIT TO OPERATE CURRE")) 
                                            {
                                                var ASIModels = ASISubGroup.getAsiList();
                                                if (ASIModels) 
                                                {
                                                    for (var m = 0; m < ASIModels.size(); m++) 
                                                    {
                                                        var ASIModel = ASIModels.get(m);
                                                        logDebug("ASIModel.getAsiName" + ASIModel.getAsiName() + "," + "ASI value: " + ASIModel.getAttributeValue());

                                                        if (ASIModel && ASIModel.getAsiName() == "3") 
                                                        {
                                                            logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                            asiValue = ASIModel.getAttributeValue();
                                                            if (asiValue == "CHECKED")	
                                                            {
                                                                // Create Tank
                                                                gs0 = new guideSheetObjectLOCAL(gs, gsItem);

                                                                gs0.loadInfoTables();
                                                                childTable = gs0.infoTables["UNREGISTERED TANK"];
                                                                logDebug("childTable: " + childTable);

                                                                if (childTable)
                                                                {
                                                                    for (var rowIndex in childTable)
                                                                    {
                                                                        thisRow = childTable[rowIndex];
                                                                        tankNo = thisRow["SCDHS Tank #"];
                                                                        product = thisRow["Product"];
                                                                        capacity = thisRow["Capacity"];
                                                                        location = thisRow["Location"];
                                                                        constMaterial = thisRow["Construction Material"];
                                                                        epa = thisRow["EPA"];
                                                                        pbs = thisRow["PBS"];
                                                                        comments = thisRow["Comments"];
                                                                        if (tankNo && tankNo != "")
                                                                        {
                                                                            logDebug("tankNo: " + tankNo);
                                                                        }
                                                                        if (product && product != "")
                                                                        {
                                                                            logDebug("product: " + product);
                                                                        }
                                                                        if (capacity && capacity != "")
                                                                        {
                                                                            logDebug("capacity: " + capacity);
                                                                        }
                                                                        if (location && location != "")
                                                                        {
                                                                            logDebug("location: " + location);
                                                                        }
                                                                        if (constMaterial && constMaterial != "")
                                                                        {
                                                                            logDebug("constMaterial: " + constMaterial);
                                                                        }
                                                                        if (epa && epa != "")
                                                                        {
                                                                            logDebug("epa: " + epa);
                                                                        }
                                                                        if (pbs && pbs != "")
                                                                        {
                                                                            logDebug("pbs: " + pbs);
                                                                        }
                                                                        if (comments && comments != "")
                                                                        {
                                                                            logDebug("comments: " + comments);
                                                                        }
                                                                        logDebug("rowIndex: " + rowIndex);


                                                                        if (!publicUser)
                                                                        {
                                                                            // Add child under SITE
                                                                            var childTankCapId = createChild("DEQ", "OPC", "Hazardous Tank", "Permit", "UR TANK");
                                                                            logDebug("Child cap ID is: " + childTankCapId);
                                                                            logDebug("Child alt ID is: " + childTankCapId.getCustomID());

                                                                            logDebug("Update SCDHS Tank #" + tankNo);
                                                                            editAppSpecific("SCDHS Tank #", tankNo, childTankCapId);

                                                                            logDebug("Update Official Use Code UR");
                                                                            editAppSpecific("Official Use Code", "UR", childTankCapId);


                                                                            logDebug("PBS Tank" + pbs);
                                                                            editAppSpecific("PBS Tank", pbs, childTankCapId);


                                                                            logDebug("Update EPA Tank" + epa);
                                                                            editAppSpecific("EPA Tank", epa, childTankCapId);


                                                                            logDebug("Update Capacity" + capacity);
                                                                            editAppSpecific("Capacity", capacity, childTankCapId);


                                                                            logDebug("Update Tank Location" + location);
                                                                            editAppSpecific("Tank Location", location, childTankCapId);

                                                                            // Detailed Description: product + "Construction Material" + comments
                                                                            var description = product + " Construction Material " + comments;
                                                                            logDebug("Update description:" + description);

                                                                            updateWorkDesc(description, childTankCapId)
                                                                            // Project Name
                                                                            var name = "UR TANK"
                                                                            updateShortNotes(name, childTankCapId);
                                                                            editAppName(name, childTankCapId);


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
        }
}
}

//IA Record Creation from WWM Record 



if (appTypeArray[1] == "WWM")
{
    //if (inspType == "WWM_RES_System 1") 

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
            var x = 0;
            for (x in vGuideSheetArray)
            {
                var iaManufacturer = null;
                var iaModel = null;
                var iaLeachPoolType = null;
                var iaLeachOtherType = null;
                var iaEffluentPumpOther = null;
                var iaEffluentPumpPools = null;
                var iaLeachProduct = null;
                var iaNumber = null;
                var iaASIModel = null;
                var vGuideSheet = vGuideSheetArray[x];
                if ("Sewage Disposal & Water Supply".toUpperCase() == vGuideSheet.getGuideType().toUpperCase() && vGuideSheet.getItems() != null)
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
                                            if (ASIModel.getAsiName() == "Manufacturer")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "IA Treatment Unit")
                                                {
                                                    iaManufacturer = ASIModel.getAttributeValue();
                                                }

                                            }
                                            else if (ASIModel.getAsiName() == "Model")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "IA Treatment Unit")
                                                {
                                                    iaModel = ASIModel.getAttributeValue();
                                                }

                                            }
                                            else if (ASIModel.getAsiName() == "Type")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "Leaching Pool(s)/Galley(s)")
                                                {
                                                    iaLeachPoolType = ASIModel.getAttributeValue();
                                                }

                                            }
                                            else if (ASIModel.getAsiName() == "Leaching Type")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "Other Leaching Structures")
                                                {
                                                    iaLeachOtherType = ASIModel.getAttributeValue();
                                                }

                                            }
                                            else if (ASIModel.getAsiName() == "Leaching Product")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "Other Leaching Structures")
                                                {
                                                    iaLeachProduct = ASIModel.getAttributeValue();
                                                }
                                            }
                                            else if (ASIModel.getAsiName() == "Effluent Pump")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "Leaching Pool(s)/Galley(s)")
                                                {
                                                    iaEffluentPumpPools = ASIModel.getAttributeValue();
                                                }

                                            }
                                            else if (ASIModel.getAsiName() == "Effluent Pump:")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "Other Leaching Structures")
                                                {
                                                    iaEffluentPumpOther = ASIModel.getAttributeValue();
                                                }

                                            }
                                            else if (ASIModel.getAsiName() == "IA Record Number")
                                            {
                                                logDebug("ASI value: " + ASIModel.getAttributeValue());
                                                if (vGuideSheetItem.getGuideItemText() == "IA Treatment Unit")
                                                {
                                                    iaNumber = ASIModel.getAttributeValue();
                                                    if (ASIModel.getAttributeValue() == null)
                                                    {
                                                        iaASIModel = ASIModel;
                                                    }

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
                if (iaManufacturer)
                {
                    var getCapResult = aa.cap.getCapIDsByAppSpecificInfoField("Technology Name/Series", iaManufacturer);
                    if (getCapResult.getSuccess())
                    {
                        var apsArray = getCapResult.getOutput();
                        for (aps in apsArray)
                        {
                            myCap = aa.cap.getCap(apsArray[aps].getCapID()).getOutput();
                            logDebug("apsArray = " + apsArray);
                            var relCap = myCap.getCapID();
                            logDebug("relCapID = " + relCap.getCustomID());
                            var relCapID = relCap.getCustomID();
                        }
                    }
                    if (iaNumber == null)
                    {
                        logDebug("Effluent Pump Pool = " + iaEffluentPumpPools);
                        var desc = "Installed: " + inspSchedDate;
                        var wwmIA = createChild('DEQ', 'Ecology', 'IA', 'Application', desc);
                        logDebug("wwmIA =" + wwmIA);
                        var iaCustom = wwmIA.getCustomID();
                        if (relCap != null)
                        {
                            copyLicensedProfByType(capId, wwmIA, ["IA Installer"]);
                            copyLicensedProfByType(relCap, wwmIA, ["IA Vendor"]);
                        }
                        else
                        {
                            copyLicensedProfByType(capId, wwmIA, ["IA Installer"]);
                        }
                        copyContactsByType(capId, wwmIA, ["Property Owner"]);
                        copyAddress(capId, wwmIA);
                        copyParcel(capId, wwmIA);
                        copyDocumentsToCapID(capId, wwmIA);
                        editAppSpecificLOCAL("Installation Date", inspSchedDate, wwmIA);
                        editAppSpecificLOCAL("Manufacturer", iaManufacturer, wwmIA);
                        editAppSpecificLOCAL("Model", iaModel, wwmIA);
                        editAppSpecificLOCAL("WWM Application Number", capIDString, wwmIA);
                        editAppSpecificLOCAL("Leaching Manufacturer", iaLeachProduct, wwmIA);
                        editAppSpecificLOCAL("Next Sample Date", inspSchedDatePlusThree, wwmIA);
                        editAppSpecificLOCAL("Next Service Date", inspSchedDatePlusOne, wwmIA);
                        if (!matches(iaLeachOtherType, null, "", " ", undefined) && !matches(iaLeachProduct, null, "", " ", undefined))
                        {
                            updateWorkDesc(iaManufacturer + " " + iaModel + " " + iaLeachOtherType + " " + iaLeachProduct, wwmIA);
                        }
                        else if (!matches(iaLeachPoolType, null, "", " ", undefined))
                        {
                            updateWorkDesc(iaManufacturer + " " + iaModel + " " + iaLeachPoolType, wwmIA);
                        }
                        else if (matches(iaLeachOtherType, null, "", " ", undefined) && matches(iaLeachProduct, null, "", " ", undefined) && matches(iaLeachPoolType, null, "", " ", undefined))
                        {
                            updateWorkDesc(iaManufacturer + " " + iaModel, wwmIA);
                        }
                        if (iaLeachPoolType != null)
                        {
                            editAppSpecificLOCAL("Leaching", iaLeachPoolType, wwmIA);
                        }
                        else if (iaLeachPoolType == null)
                        {
                            editAppSpecificLOCAL("Leaching", iaLeachOtherType, wwmIA);
                        }
                        if (iaEffluentPumpPools != null)
                        {
                            editAppSpecificLOCAL("Effluent Pump", iaEffluentPumpPools, wwmIA);
                        }
                        else if (iaEffluentPumpPools == null)
                        {
                            editAppSpecificLOCAL("Effluent Pump", iaEffluentPumpOther, wwmIA);
                        }
                        var currentIANumber = getAppSpecific("IA Number", capId);

                        if (matches(currentIANumber, undefined, null, "", " "))
                        {
                            editAppSpecificLOCAL("IA Number", iaCustom, capId)
                        }
                        else
                        {
                            editAppSpecificLOCAL("IA Number", currentIANumber + " " + iaCustom, capId)
                        }
                        var pinNumber = makePIN(8);
                        editAppSpecific('IA PIN Number', pinNumber, wwmIA)




                        //Update the guidesheet
                        if (iaASIModel)
                        {
                            iaASIModel.setAttributeValue(iaCustom);
                            var updateResult = aa.guidesheet.updateGGuidesheet(vGuideSheet, vGuideSheet.getAuditID());
                            if (updateResult.getSuccess())
                            {
                                logDebug("Successfully updated guidesheet on inspection " + inspId + ".");
                            } else
                            {
                                logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                            }
                        }

                        /*var labResultsTable = new Array();
                        var newRow = new Array();
                        newRow["Technology"] = iaManufacturer;
                        newRow["Email"] = "";
                        newRow["Site Name"] = ""; 
                        newRow["Site Address"] = "";
                        newRow["Site City"] = "";
                        newRow["WWM#"] = capId.getCustomID();
                        newRow["IA#"] = wwmIA.getCustomID();
                        labResultsTable.push(newRow);
                        addASITable("LAB RESULTS", labResultsTable, wwmIA);*/

                        //Start Notification to Parent Contacts/LPs
                        logDebug("capId = " + capId);
                        var AInfo = new Array();
                        logDebug("parentCapId = " + parentCapId);
                        var conEmail = "";
                        //var wwmIA = capId.getCustomID();
                        logDebug("wwmIA =" + wwmIA);
                        var pin = getAppSpecific('IA PIN Number', wwmIA);
                        logDebug("pin = " + pin);
                        var altId = capId.getCustomID();
                        var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);
                        if (capParcelResult.getSuccess())
                        {
                            var Parcels = capParcelResult.getOutput().toArray();
                            for (zz in Parcels)
                            {
                                var parcelNumber = Parcels[zz].getParcelNumber();
                                logDebug("parcelNumber = " + parcelNumber);
                            }
                        }


                        //gathering LPs from parent
                        var licProfResult = aa.licenseScript.getLicenseProf(capId);
                        var capLPs = licProfResult.getOutput();
                        logDebug("CapLPs = " + capLPs);
                        for (l in capLPs)
                        {
                            logDebug("capLPs = " + capLPs[l]);
                            if (!matches(capLPs[l].email, null, undefined, ""))
                            {
                                logDebug("LP emails = " + capLPs[l].email);
                                conEmail += capLPs[l].email + ";"
                                logDebug("conEmail = " + conEmail);
                            }
                        }

                        // //gathering IA Vendor LP
                        // var wwmIALicProfResult = aa.licenseScript.getLicenseProf(wwmIA);
                        // var iaVendorLPs = wwmIALicProfResult.getOutput();
                        // for (v in iaVendorLPs)
                        // {
                        //     if (iaVendorLPs[v].getLicenseType() == "IA Vendor")
                        //     {
                        //         conEmail += iaVendorLPs[v].email + ";"
                        //     }
                        // }





                        //gathering contacts from parent
                        var contactResult = aa.people.getCapContactByCapID(capId);
                        var capContacts = contactResult.getOutput();
                        for (c in capContacts)
                        {
                            logDebug("capContacts = " + capContacts[c]);
                            if (!matches(capContacts[c].email, null, undefined, ""))
                            {
                                logDebug("contact emails = " + capContacts[c].email);
                                conEmail += capContacts[c].email + ";"
                                logDebug("conEmail post contacts = " + conEmail);
                            }
                        }


                        //Sending Notification

                        var vEParams = aa.util.newHashtable();
                        var addrResult = getAddressInALine(capId);
                        addParameter(vEParams, "$$altID$$", iaCustom);
                        addParameter(vEParams, "$$address$$", addrResult);
                        addParameter(vEParams, "$$pin$$", pin);
                        addParameter(vEParams, "$$wwmAltID$$", altId);
                        addParameter(vEParams, "$$Parcel$$", parcelNumber);

                        sendNotification("", conEmail, "", "DEQ_IA_APPLICATION_NOTIFICATION", vEParams, null);

                    }

                    else
                    {
                        var getCapResult = aa.cap.getCapID(iaNumber);
                        if (getCapResult.getSuccess())
                        {
                            var wwmIA = getCapResult.getOutput();
                            editAppSpecificLOCAL("Installation Date", insCon, wwmIA);
                            editAppSpecificLOCAL("Manufacturer", iaManufacturer, wwmIA);
                            editAppSpecificLOCAL("Model", iaModel, wwmIA);
                            editAppSpecificLOCAL("WWM Application Number", capIDString, wwmIA);
                            editAppSpecificLOCAL("Leaching Manufacturer", iaLeachProduct, wwmIA);
                            if (iaLeachPoolType != null)
                            {
                                editAppSpecificLOCAL("Leaching", iaLeachPoolType, wwmIA);
                            }
                            else if (iaLeachPoolType == null)
                            {
                                editAppSpecificLOCAL("Leaching", iaLeachOtherType, wwmIA);
                            }
                            if (iaEffluentPumpPools != null)
                            {
                                editAppSpecificLOCAL("Effluent Pump", iaEffluentPumpPools, wwmIA);
                            }
                            else if (iaEffluentPumpPools == null)
                            {
                                editAppSpecificLOCAL("Effluent Pump", iaEffluentPumpOther, wwmIA);
                            }
                            //updating workdesc
                            if (!matches(iaLeachOtherType, null, "", " ", undefined) && !matches(iaLeachProduct, null, "", " ", undefined))
                            {
                                updateWorkDesc(iaManufacturer + " " + iaModel + " " + iaLeachOtherType + " " + iaLeachProduct, wwmIA);
                            }
                            else if (!matches(iaLeachPoolType, null, "", " ", undefined))
                            {
                                updateWorkDesc(iaManufacturer + " " + iaModel + " " + iaLeachPoolType, wwmIA);
                            }
                            else if (matches(iaLeachOtherType, null, "", " ", undefined) && matches(iaLeachProduct, null, "", " ", undefined) && matches(iaLeachPoolType, null, "", " ", undefined))
                            {
                                updateWorkDesc(iaManufacturer + " " + iaModel, wwmIA);
                            }
                        }
                        else
                        {logDebug("**ERROR: getting cap id (" + iaNumber + "): " + getCapResult.getErrorMessage())}


                    }
                }
                else
                {
                    logDebug("No Manufacturer");
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

}

function copyLicenseProfessional(srcCapId, targetCapId) {
    //1. Get license professionals with source CAPID.
    var capLicenses = getLicenseProfessional(srcCapId);
    if (capLicenses == null || capLicenses.length == 0)
    {
        return;
    }
    //2. Get license professionals with target CAPID.
    var targetLicenses = getLicenseProfessional(targetCapId);
    //3. Check to see which licProf is matched in both source and target.
    for (loopk in capLicenses)
    {
        sourcelicProfModel = capLicenses[loopk];
        //3.1 Set target CAPID to source lic prof.
        sourcelicProfModel.setCapID(targetCapId);
        targetLicProfModel = null;
        //3.2 Check to see if sourceLicProf exist.
        if (targetLicenses != null && targetLicenses.length > 0)
        {
            for (loop2 in targetLicenses)
            {
                if (isMatchLicenseProfessional(sourcelicProfModel, targetLicenses[loop2]))
                {
                    targetLicProfModel = targetLicenses[loop2];
                    break;
                }
            }
        }
        //3.3 It is a matched licProf model.
        if (targetLicProfModel != null)
        {
            //3.3.1 Copy information from source to target.
            aa.licenseProfessional.copyLicenseProfessionalScriptModel(sourcelicProfModel, targetLicProfModel);
            //3.3.2 Edit licProf with source licProf information. 
            aa.licenseProfessional.editLicensedProfessional(targetLicProfModel);
        }
        //3.4 It is new licProf model.
        else
        {
            //3.4.1 Create new license professional.
            aa.licenseProfessional.createLicensedProfessional(sourcelicProfModel);
        }
    }
}

function copyDocumentsToCapID(fromCapID, toCapID) {
    var opDocArray = aa.document.getDocumentListByEntity(fromCapID.toString(), "CAP").getOutput();
    var vDocArray = opDocArray.toArray();
    for (var vCounter in vDocArray)
    {
        var vDoc = vDocArray[vCounter];
        aa.document.createDocumentAssociation(vDoc, toCapID.toString(), "CAP");
    }
}

function getGuidesheetASIField(pInspId, gName, gItem, asiGroup, asiSubGroup, asiLabel) {
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
function editAppSpecificLOCAL(itemName, itemValue)  // optional: itemCap
{
    var itemCap = capId;
    var itemGroup = null;
    if (arguments.length == 3) itemCap = arguments[2]; // use cap ID specified in args

    if (useAppSpecificGroupName)
    {
        if (itemName.indexOf(".") < 0) {logDebug("**WARNING: (editAppSpecific) requires group name prefix when useAppSpecificGroupName is true"); return false}


        itemGroup = itemName.substr(0, itemName.indexOf("."));
        itemName = itemName.substr(itemName.indexOf(".") + 1);
    }
    // change 2/2/2018 - update using: aa.appSpecificInfo.editAppSpecInfoValue(asiField)
    // to avoid issue when updating a blank custom form via script. It was wiping out the field alias 
    // and replacing with the field name

    var asiFieldResult = aa.appSpecificInfo.getByList(itemCap, itemName);
    if (asiFieldResult.getSuccess())
    {
        var asiFieldArray = asiFieldResult.getOutput();
        if (asiFieldArray.length > 0)
        {
            var asiField = asiFieldArray[0];
            if (asiField)
            {
                var origAsiValue = asiField.getChecklistComment();
                asiField.setChecklistComment(itemValue);

                var updateFieldResult = aa.appSpecificInfo.editAppSpecInfoValue(asiField);
                if (updateFieldResult.getSuccess())
                {
                    logDebug("Successfully updated custom field on record: " + itemCap.getCustomID() + " on " + itemName + " with value: " + itemValue);
                    if (arguments.length < 3) //If no capId passed update the ASI Array
                        AInfo[itemName] = itemValue;
                }
                else {logDebug("WARNING: (editAppSpecific) " + itemName + " was not updated.");}
            }
            else {logDebug("WARNING: (editAppSpecific) " + itemName + " was not updated.");}
        }
    }
    else
    {
        logDebug("ERROR: (editAppSpecific)" + asiFieldResult.getErrorMessage());
    }
}
function makePIN(length) {
    var result = '';
    var characters = 'ABCDEFGHJKMNPQRTWXY2346789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++)
    {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function createChild(grp, typ, stype, cat, desc) // optional parent capId
{
    //
    // creates the new application and returns the capID object
    //

    var itemCap = capId
    if (arguments.length > 5) itemCap = arguments[5]; // use cap ID specified in args

    var appCreateResult = aa.cap.createApp(grp, typ, stype, cat, desc);
    logDebug("creating cap " + grp + "/" + typ + "/" + stype + "/" + cat);
    if (appCreateResult.getSuccess())
    {
        var newId = appCreateResult.getOutput();
        logDebug("cap " + grp + "/" + typ + "/" + stype + "/" + cat + " created successfully ");

        // create Detail Record
        capModel = aa.cap.newCapScriptModel().getOutput();
        capDetailModel = capModel.getCapModel().getCapDetailModel();
        capDetailModel.setCapID(newId);
        aa.cap.createCapDetail(capDetailModel);

        var newObj = aa.cap.getCap(newId).getOutput();	//Cap object
        var result = aa.cap.createAppHierarchy(itemCap, newId);
        if (result.getSuccess())
            logDebug("Child application successfully linked");
        else
            logDebug("Could not link applications");

        // Copy Parcels

        var capParcelResult = aa.parcel.getParcelandAttribute(itemCap, null);
        if (capParcelResult.getSuccess())
        {
            var Parcels = capParcelResult.getOutput().toArray();
            for (zz in Parcels)
            {
                logDebug("adding parcel #" + zz + " = " + Parcels[zz].getParcelNumber());
                var newCapParcel = aa.parcel.getCapParcelModel().getOutput();
                newCapParcel.setParcelModel(Parcels[zz]);
                newCapParcel.setCapIDModel(newId);
                newCapParcel.setL1ParcelNo(Parcels[zz].getParcelNumber());
                newCapParcel.setParcelNo(Parcels[zz].getParcelNumber());
                aa.parcel.createCapParcel(newCapParcel);

            }
        }

        // Copy Contacts
        /*capContactResult = aa.people.getCapContactByCapID(itemCap);
        if (capContactResult.getSuccess())
            {
            Contacts = capContactResult.getOutput();
            for (yy in Contacts)
                {
                var newContact = Contacts[yy].getCapContactModel();
                newContact.setCapID(newId);
                aa.people.createCapContact(newContact);
                logDebug("added contact");
                }
            }	*/

        // Copy Addresses
        capAddressResult = aa.address.getAddressByCapId(itemCap);
        if (capAddressResult.getSuccess())
        {
            Address = capAddressResult.getOutput();
            for (yy in Address)
            {
                newAddress = Address[yy];
                newAddress.setCapID(newId);
                aa.address.createAddress(newAddress);
                logDebug("added address");
            }
        }

        return newId;
    }
    else
    {
        logDebug("**ERROR: adding child App: " + appCreateResult.getErrorMessage());
    }
}
function copyContactsByType(srcCapId, targetCapId, ContactTypeArr) {
    //1. Get people with source CAPID.
    var capPeoples = getPeople3_0(srcCapId);
    if (capPeoples == null || capPeoples.length == 0)
    {
        return;
    }
    //2. Get people with target CAPID.
    var targetPeople = getPeople3_0(targetCapId);
    //3. Check to see which people is matched in both source and target.
    for (loopk in capPeoples)
    {
        sourcePeopleModel = capPeoples[loopk];
        //Check if contact type should be ignored
        doCopy = false;
        for (kk in ContactTypeArr)
        {
            if (ContactTypeArr[kk] == sourcePeopleModel.getCapContactModel().getContactType())
                doCopy = true;
        }
        if (doCopy)
        {
            //3.1 Set target CAPID to source people.
            sourcePeopleModel.getCapContactModel().setCapID(targetCapId);
            targetPeopleModel = null;
            //3.2 Check to see if sourcePeople exist.
            if (targetPeople != null && targetPeople.length > 0)
            {
                for (loop2 in targetPeople)
                {
                    if (isMatchPeople3_0(sourcePeopleModel, targetPeople[loop2]))
                    {
                        targetPeopleModel = targetPeople[loop2];
                        break;
                    }
                }
            }
            //3.3 It is a matched people model.
            if (targetPeopleModel != null)
            {
                //3.3.1 Copy information from source to target.
                aa.people.copyCapContactModel(sourcePeopleModel.getCapContactModel(), targetPeopleModel.getCapContactModel());
                //3.3.2 Copy contact address from source to target.
                if (targetPeopleModel.getCapContactModel().getPeople() != null && sourcePeopleModel.getCapContactModel().getPeople())
                {
                    targetPeopleModel.getCapContactModel().getPeople().setContactAddressList(sourcePeopleModel.getCapContactModel().getPeople().getContactAddressList());
                }
                //3.3.3 Edit People with source People information.
                aa.people.editCapContactWithAttribute(targetPeopleModel.getCapContactModel());
            }
            //3.4 It is new People model.
            else
            {
                //3.4.1 Create new people.
                aa.people.createCapContactWithAttribute(sourcePeopleModel.getCapContactModel());
            }
        }
    }
}
function getPeople3_0(capId) {
    capPeopleArr = null;
    var s_result = aa.people.getCapContactByCapID(capId);
    if (s_result.getSuccess())
    {
        capPeopleArr = s_result.getOutput();
        if (capPeopleArr != null || capPeopleArr.length > 0)
        {
            for (loopk in capPeopleArr)
            {
                var capContactScriptModel = capPeopleArr[loopk];
                var capContactModel = capContactScriptModel.getCapContactModel();
                var peopleModel = capContactScriptModel.getPeople();
                var contactAddressrs = aa.address.getContactAddressListByCapContact(capContactModel);
                if (contactAddressrs.getSuccess())
                {
                    var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());
                    peopleModel.setContactAddressList(contactAddressModelArr);
                }
            }
        }
        else
        {
            logDebug("WARNING: no People on this CAP:" + capId);
            capPeopleArr = null;
        }
    }
    else
    {
        logDebug("ERROR: Failed to People: " + s_result.getErrorMessage());
        capPeopleArr = null;
    }
    return capPeopleArr;
}
function copyLicensedProfByType(capIdFrom, capIdTo, typesArray) {
    var n = aa.licenseProfessional.getLicensedProfessionalsByCapID(capIdFrom).getOutput();
    var isByType = typesArray != null && typesArray.length > 0;
    if (n != null)
        for (x in n)
        {
            if (isByType && !arrayContainsValue(typesArray, n[x].getLicenseType()))
            {
                continue;
            }//isByType
            n[x].setCapID(capIdTo);
            aa.licenseProfessional.createLicensedProfessional(n[x]);
        }//for all LPs
    else
        logDebug("No licensed professional on source");
    return true;
}
function arrayContainsValue(ary, value) {
    if (ary != null)
    {
        //if not array, convert to array
        if (!Array.isArray(ary))
        {
            ary = [ary];
        }
        for (t in ary)
        {
            if (ary[t] == value)
            {
                return true;
            }
        }//for all types
    }
    return false;
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

function guideSheetObjectLOCAL(gguidesheetModel, gguidesheetItemModel) {
    this.gsType = gguidesheetModel.getGuideType();
    this.gsSequence = gguidesheetModel.getGuidesheetSeqNbr();
    this.gsDescription = gguidesheetModel.getGuideDesc();
    this.gsIdentifier = gguidesheetModel.getIdentifier();
    this.item = gguidesheetItemModel;
    this.text = gguidesheetItemModel.getGuideItemText()
    this.status = gguidesheetItemModel.getGuideItemStatus();
    this.comment = gguidesheetItemModel.getGuideItemComment();
    this.score = gguidesheetItemModel.getGuideItemScore();

    this.info = new Array();
    this.infoTables = new Array();
    this.validTables = false;				//true if has ASIT info
    this.validInfo = false;				//true if has ASI info


    this.loadInfo = function () {
        var itemASISubGroupList = this.item.getItemASISubgroupList();
        //If there is no ASI subgroup, it will throw warning message.
        if (itemASISubGroupList != null)
        {
            this.validInfo = true;
            var asiSubGroupIt = itemASISubGroupList.iterator();
            while (asiSubGroupIt.hasNext())
            {
                var asiSubGroup = asiSubGroupIt.next();
                var asiItemList = asiSubGroup.getAsiList();
                if (asiItemList != null)
                {
                    var asiItemListIt = asiItemList.iterator();
                    while (asiItemListIt.hasNext())
                    {
                        var asiItemModel = asiItemListIt.next();
                        this.info[asiItemModel.getAsiName()] = asiItemModel.getAttributeValue();

                    }
                }
            }
        }
    }

    this.loadInfoTables = function () {
        var guideItemASITs = this.item.getItemASITableSubgroupList();
        if (guideItemASITs != null)
        {
            logDebug(guideItemASITs.size());
            for (var j = 0; j < guideItemASITs.size(); j++)
            {
                var guideItemASIT = guideItemASITs.get(j);
                var tableArr = new Array();
                var columnList = guideItemASIT.getColumnList();
                for (var k = 0; k < columnList.size(); k++)
                {
                    var column = columnList.get(k);
                    var values = column.getValueMap().values();
                    var iteValues = values.iterator();
                    while (iteValues.hasNext())
                    {
                        var i = iteValues.next();
                        var zeroBasedRowIndex = i.getRowIndex() - 1;
                        if (tableArr[zeroBasedRowIndex] == null) tableArr[zeroBasedRowIndex] = new Array();
                        tableArr[zeroBasedRowIndex][column.getColumnName()] = i.getAttributeValue();
                    }
                }
                this.infoTables["" + guideItemASIT.getTableName()] = tableArr;
                this.validTables = true;
            }
        }
    }
}

