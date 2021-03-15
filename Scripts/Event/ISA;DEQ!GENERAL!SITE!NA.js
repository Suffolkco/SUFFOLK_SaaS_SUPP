//ISA:DEQ/GENERAL/SITE/NA
showDebug = false;

var inspections = aa.inspection.getInspections(capId);
if (inspections.getSuccess()) 
{
    insps = inspections.getOutput();
	logDebug("Inspection length is: " + insps.length);
	outerLoop:
	for (var i = 0; i < insps.length; i++) 
	{
        logDebug("Inspection Type is: " + insps[i].getInspectionType());
		if (insps[i].getInspectionType() == ("Sampling Event")) 
		{
			var inspModel = insps[i].getInspection();
			var gs = inspModel.getGuideSheets();
			if (!gs.isEmpty()) 
			{
				checkLoop:
				for (var j = 0; j < gs.size(); j++) 
				{
                    var guideSheetObj = gs.get(j);
                    var guidesheetItem = guideSheetObj.getItems();
                    //logDebug("guidesheetItem " + guidesheetItem.get(i));
                    //logDebug("Checklist name is: " + guideSheetObj.getGuideType().toUpperCase());
					if (guideSheetObj.getGuideType().toUpperCase() == "LAB METHODS") 
					{
                        logDebug("Checklist ID is: " + guideSheetObj.getIdentifier());
						if (guideSheetObj.getIdentifier() == null)
						{
                            inspSeq = insps[i].getIdNumber().toString();
                            inspThree = inspSeq.slice(-3);
							schDate = insps[i].getScheduledDate();
							reqDate = insps[i].getRequestDate();
                            inspId = insps[i].getIdNumber();
                            logDebug("inspId id: " + inspId);
							schYear = schDate.getYear().toString();
							schYearTwo = schYear.slice(-2);
							schMonth = schDate.getMonth().toString();
							schDay = schDate.getDayOfMonth().toString();
							if (schMonth.length == 1) 
							{
								schMonth = "0" + schMonth;
							}
							if (schDay.length == 1) 
							{
								schDay = "0" + schDay;
							}
                            inspect = insps[i].getInspector();
                            inspectStr = String(inspect);
                            if (inspectStr.length >= 1)
                            {
                                inspectFirst = inspect.getFirstName();
                                inspectLast = inspect.getLastName();
                                inspector = getOutput(aa.people.getUsersByUserIdAndName("", inspectFirst, "", inspectLast), "")[0];
                                if (inspector != null) 
                                {
                                    inspectUser = inspector.getUserID();
                                    UserObj = aa.person.getUser(inspectUser).getOutput();
                                    inspectIn = UserObj.getInitial();
                                    concat = inspThree + "-" + inspectIn + "-" + schYearTwo + schMonth + schDay;
                                    guideSheetObj.setIdentifier(concat);
                                    aa.guidesheet.updateGGuidesheet(guideSheetObj, guideSheetObj.getAuditID());
									logDebug("Updated Checklist ID to: " + concat);
									var newdata = [];
									var childArray = getChildren("*/*/*/*", capId);
									for (var c in childArray) 
									{
										var childId = childArray[c];
										if (appMatch("DEQ/General/Special Event/Application",childId) || appMatch("DEQ/WR/Groundwater/Monitoring",childId) || appMatch("DEQ/WR/Other Well/Monitoring",childId) || appMatch("DEQ/WR/Private Well Request/Application",childId) || appMatch("DEQ/WR/Public Well Surface Water/Monitoring",childId) || appMatch("DEQ/WR/Public Water Complaint/NA",childId) || appMatch("DEQ/WR/Bottle Water/Review",childId) || appMatch("DEQ/WWM/STP/Monitoring",childId)) 
										{
											var newRow = [];
											var childCustomId = childId.getCustomID();
											var childName = aa.cap.getCapDetail(childId).getOutput().getShortNotes();
											var wellId = getAppSpecific("Well/ID Name", childId);
								
											if (wellId != null)
											{
											logDebug("wellId:" + wellId);
											}
											newRow["Child Record"] = new asiTableValObj("Child Record", String(childCustomId), "Y");	
											newRow["Application Name"] = new asiTableValObj("Application Name", childName ? String("" + childName) : "", "Y");
											if (wellId != null)
											{
											if (appMatch("DEQ/WR/Groundwater/Monitoring",childId))
											{
													logDebug("appMatch, childId:" + childCustomId);
													logDebug("Add row and put:" + wellId);
													newRow["Well/ID Name"] = new asiTableValObj("Well/ID Name", wellId, "Y");
												}
											}
											newdata.push(newRow);	
										}
									}
									for (var x = 0; x < guidesheetItem.size(); x++)
									{
										var item = guidesheetItem.get(x);
										if (item.getGuideItemText() == "Children Records" && item.getGuideItemASIGroupName() == "LAB METHOD") 
										{
											logDebug("here");
											addToGASIT(item, "CHILDREN RECORDS", newdata);
										}  
									}
                                }
                            }
                            else
                            {
								logDebug("There is no Inspector on this inspection, cannot create Checklist ID");
								break checkLoop;
                            }
						}
						else
						{
							logDebug("This LAB METHODS checklist already has an ID: " + guideSheetObj.getIdentifier());
							break checkLoop;
						}
					}
				}
			}
        }
    }
}

function addToGASIT(gsi, pTableName, pArrayToAdd) {
	var gsb = aa.proxyInvoker.newInstance("com.accela.aa.inspection.guidesheet.GGuideSheetBusiness").getOutput();
	logDebug("**GUIDESHEET ITEM: " + gsi.getGuideItemText());
	var gsAsitGrpList = gsi.getItemASITableSubgroupList();
	if (gsAsitGrpList != null) {
		for (var z = 0; z < gsAsitGrpList.size(); z++) {
			var guideItemASIT = gsAsitGrpList.get(z);
			if (guideItemASIT.getTableName() == pTableName) {
				var newColumnList = guideItemASIT.getColumnList();
				for (var k = 0; k < newColumnList.size(); k++) {
					if (!updateComplete) // right column but row not found create a new row.
					{

						logDebug("Creating new entry in column");
						var column = newColumnList.get(k);
						logDebug("Column " + column.getColumnName());
						for (l = 0; l < pArrayToAdd.length; l++) {
							if (typeof(pArrayToAdd[l][column.getColumnName()]) == "object") // we are passed an asiTablVal Obj
							{
								var cValueMap = column.getValueMap();
								var newColumn = new com.accela.aa.inspection.guidesheet.asi.GGSItemASITableValueModel;
								var pReadOnly = "F";
								logDebug(pArrayToAdd[l][column.getColumnName()]);
								newColumn.setColumnIndex(z);
								newColumn.setRowIndex(l);
								newColumn.setAttributeValue(pArrayToAdd[l][column.getColumnName()]);
								newColumn.setAuditDate(new java.util.Date());
								newColumn.setAuditID("ADMIN");
								if (pReadOnly == "Y")
									newColumn.setValueReadonly("Y");
								l
								cValueMap.put(l, newColumn);

							}
						}

					}
				}

				var updateComplete = true;

			}
		}
	}

	if (updateComplete) {
		logDebug("updating");
		gsb.updateGuideSheetItem(gsi, "ADMIN");
	}

}

function getOutput(result, object) {
	if (result.getSuccess()) {
		return result.getOutput();
	} else {
		logError("ERROR: Failed to get " + object + ": " + result.getErrorMessage());
		return null;
	}
}