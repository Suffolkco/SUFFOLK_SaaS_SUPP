if (inspType == "Experimental Composite" || "Experimental Grab" || "Pilot Composite" || "Pilot Grab" || "QAQC 1" || "QAQC 2" || "QAQC Split Sample" || "Investigation") 
{
    var insYear = inspObj.getInspectionStatusDate().getYear().toString();
    var insMonth = inspObj.getInspectionStatusDate().getMonth().toString();
    var insDay = inspObj.getInspectionStatusDate().getDayOfMonth().toString();

    var insCon = insMonth + "/" + insDay + "/" + insYear;
    
    if (inspResult == "Lab Results Returned")
    {
        logDebug("capId = " + capId);
        var doValue = getGuidesheetASIField(inspId, "I/A OWTS Sample", "Sample Collection", "DEQ_IA_LAB", "FIELD RESULTS", "DO");
        var phValue = getGuidesheetASIField(inspId, "I/A OWTS Sample", "Sample Collection", "DEQ_IA_LAB", "FIELD RESULTS", "PH");
        var wwTemp = getGuidesheetASIField(inspId, "I/A OWTS Sample", "Sample Collection", "DEQ_IA_LAB", "FIELD RESULTS", "WW TEMP");
        var airTemp = getGuidesheetASIField(inspId, "I/A OWTS Sample", "Sample Collection", "DEQ_IA_LAB", "FIELD RESULTS", "Air Temp");
        var date =  getGuidesheetASIField(inspId, "I/A OWTS Sample", "Sample Collection", "DEQ_IA_LAB", "FIELD RESULTS", "Date");
        var comment = getGuidesheetASIField(inspId, "I/A OWTS Sample", "Sample Collection", "DEQ_IA_LAB", "FIELD RESULTS", "Comment");
        var phase = getGuidesheetASIField(inspId, "I/A OWTS Sample", "Scheduling Information", "DEQ_INSP_SCH", "SCHEDULING INSPECTION", "Phase");
        var process = getGuidesheetASIField(inspId, "I/A OWTS Sample", "Scheduling Information", "DEQ_INSP_SCH", "SCHEDULING INSPECTION", "Process");
        var collection = getGuidesheetASIField(inspId, "I/A OWTS Sample", "Scheduling Information", "DEQ_INSP_SCH", "SCHEDULING INSPECTION", "Collection");
        var collector = getGuidesheetASIField(inspId, "I/A OWTS Sample", "Scheduling Information", "DEQ_INSP_SCH", "SCHEDULING INSPECTION", "Collector");
        var fieldId = getGuidesheetASIField(inspId, "I/A OWTS Sample", "Scheduling Information", "DEQ_INSP_SCH", "SCHEDULING INSPECTION", "Field ID");
        var lab = getGuidesheetASIField(inspId, "I/A OWTS Sample", "Scheduling Information", "DEQ_INSP_SCH", "SCHEDULING INSPECTION", "Lab");

        editAppSpecificLOCAL("Most Recent Sample Date", date, capId)
    
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
                if ("I/A OWTS Sample".toUpperCase() == vGuideSheet.getGuideType().toUpperCase() && vGuideSheet.getItems() != null)
                {
                    logDebug("IA Checklist Found")
                    vGuideSheetItemsArray = vGuideSheet.getItems().toArray();
                    var z = 0;
                    for (z in vGuideSheetItemsArray)
                    {
                        var vGuideSheetItem = vGuideSheetItemsArray[z];
                        if (vGuideSheetItem && "Sample Collection" == vGuideSheetItem.getGuideItemText())
                        {
                            var labResultsTable = getGuidesheetItemASIT(vGuideSheet, vGuideSheetItem, "LAB RESULTS AND FIELD DATA");
                            var newLabResultsTable = new Array();
                            for (var l in labResultsTable)
                            {
                                var newRow = new Array();
                                newRow["Sample Date"] = date;
                                newRow["Lab ID"] = labResultsTable[l]["Lab ID"];
                                newRow["TN"] = labResultsTable[l]["TN"];
                                newRow["NO3 Nitrate"] = labResultsTable[l]["NO3 Nitrate"];
                                newRow["NO2 Nitrite"] = labResultsTable[l]["NO2 Nitrite"];
                                newRow["TKN"] = labResultsTable[l]["TKN"];
                                newRow["NH4 Ammonia"] = labResultsTable[l]["NH4 Ammonia"];
                                newRow["BOD"] = labResultsTable[l]["BOD"];
                                newRow["TSS"] = labResultsTable[l]["TSS"];
                                newRow["ALK"] = labResultsTable[l]["ALK"];
                                newRow["DO"] = doValue;
                                newRow["PH"] = phValue;
                                newRow["WW Temp"] = wwTemp;
                                newRow["Air Temp"] = airTemp;
                                newRow["Status"] = "Complete";
                                newRow["Source"] = inspId;
                                newRow["Phase"] = phase;
                                newRow["Process"] = process;
                                newRow["Collection"] = collection;
                                newRow["Collector"] = collector;
                                newRow["Field ID"] = fieldId;
                                newRow["Lab"] = lab;
                                newRow["Comment"] = comment;



                                newLabResultsTable.push(newRow);
                                break;
                            }

                            addASITable("LAB RESULTS", newLabResultsTable, capId);

                            /*
                            editASITableRow(capId, "LAB RESULTS", "Lab ID", newRow["Lab ID"]);
                            editASITableRow(capId, "LAB RESULTS", "TN", newRow["TN"]);
                            editASITableRow(capId, "LAB RESULTS", "NO3 Nitrate", newRow["NO3 Nitrate"]);
                            editASITableRow(capId, "LAB RESULTS", "NO2 Nitrite", newRow["NO2 Nitrite"]);
                            editASITableRow(capId, "LAB RESULTS", "TKN", newRow["TKN"]);
                            editASITableRow(capId, "LAB RESULTS", "NH4 Ammonia", newRow["NH4 Ammonia"]);
                            editASITableRow(capId, "LAB RESULTS", "BOD", newRow["BOD"]);
                            editASITableRow(capId, "LAB RESULTS", "TSS", newRow["TSS"]);
                            editASITableRow(capId, "LAB RESULTS", "ALK", newRow["ALK"]);
                            editASITableRow(capId, "LAB RESULTS", "DO", doValue);
                            editASITableRow(capId, "LAB RESULTS", "PH", phValue);
                            editASITableRow(capId, "LAB RESULTS", "WW Temp", wwTemp);
                            editASITableRow(capId, "LAB RESULTS", "Air Temp", airTemp);
                            editASITableRow(capId, "LAB RESULTS", "Sample Date", insCon);
                            editASITableRow(capId, "LAB RESULTS", "Status", inspResult);
                            break; */
                        }
                    }
                }
            }
        }
    }
    if (inspResult == "Lab Analysis Invalid")
    {
        editAppSpecificLOCAL("Most Recent SCDH Request", insCon, capId) 
    }
    if (inspResult == "No sampling requested")
    {
        editAppSpecificLOCAL("No Sampling Requested", insCon, capId)
    }
    if (inspResult == "Postponement Requested")
    {
        editAppSpecificLOCAL("Most Recent SCDH Request", insCon, capId)
    }

    if (inspResult == "Unable to collect sample")
    {
        editAppSpecificLOCAL("Most Recent SCDH Request", insCon, capId)
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

    function getGuidesheetItemASIT(guideSheetModel, itemModel, tableName)
    {
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
    function addASITable(tableName, tableValueArray) // optional capId
    {
        //  tableName is the name of the ASI table
        //  tableValueArray is an array of associative array values.  All elements MUST be either a string or asiTableVal object
        var itemCap = capId
        if (arguments.length > 2)
        {
            itemCap = arguments[2]; // use cap ID specified in args
        }
        var tssmResult = aa.appSpecificTableScript.getAppSpecificTableModel(itemCap, tableName)
        if (!tssmResult.getSuccess()) 
        {
            logDebug("**WARNING: error retrieving app specific table " + tableName + " " + tssmResult.getErrorMessage());
            return false;
        }
        var tssm = tssmResult.getOutput();
        var tsm = tssm.getAppSpecificTableModel();
        var fld = tsm.getTableField();
        var fld_readonly = tsm.getReadonlyField(); // get Readonly field
        for (thisrow in tableValueArray) 
        {
            var col = tsm.getColumns();
            var coli = col.iterator();
            while (coli.hasNext()) 
            {
                var colname = coli.next();
                if (!tableValueArray[thisrow][colname.getColumnName()]) 
                {
                    logDebug("addToASITable: null or undefined value supplied for column " + colname.getColumnName() + ", setting to empty string");
                    tableValueArray[thisrow][colname.getColumnName()] = "";
                }
                if (typeof (tableValueArray[thisrow][colname.getColumnName()].fieldValue) != "undefined") // we are passed an asiTablVal Obj
                {
                    fld.add(tableValueArray[thisrow][colname.getColumnName()].fieldValue);
                    fld_readonly.add(tableValueArray[thisrow][colname.getColumnName()].readOnly);
                    //fld_readonly.add(null);
                }
                else // we are passed a string
                {
                    fld.add(tableValueArray[thisrow][colname.getColumnName()]);
                    fld_readonly.add(null);
                }
            }
            tsm.setTableField(fld);
            tsm.setReadonlyField(fld_readonly);
        }
        var addResult = aa.appSpecificTableScript.editAppSpecificTableInfos(tsm, itemCap, currentUserID);
        if (!addResult.getSuccess()) 
        {
            logDebug("**WARNING: error adding record to ASI Table:  " + tableName + " " + addResult.getErrorMessage());
            return false;
        }
        else
        {
            logDebug("Successfully added record to ASI Table: " + tableName);
        }
    }
    function editAppSpecificLOCAL(itemName, itemValue)  // optional: itemCap
{
    var itemCap = capId;
    var itemGroup = null;
    if (arguments.length == 3) itemCap = arguments[2]; // use cap ID specified in args

    if (useAppSpecificGroupName)
    {
        if (itemName.indexOf(".") < 0) { logDebug("**WARNING: (editAppSpecific) requires group name prefix when useAppSpecificGroupName is true"); return false }


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
                else { logDebug("WARNING: (editAppSpecific) " + itemName + " was not updated."); }
            }
            else { logDebug("WARNING: (editAppSpecific) " + itemName + " was not updated."); }
        }
    }
    else
    {
        logDebug("ERROR: (editAppSpecific)" + asiFieldResult.getErrorMessage());
    }
}