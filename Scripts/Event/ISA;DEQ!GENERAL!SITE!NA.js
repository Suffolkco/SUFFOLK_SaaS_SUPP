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

// EHIMS-4805:
if (inspResult == "Completed" || inspResult == "Fail")
{
    if (inspType == "OPC Non-PBS Site OP Inspection" ||
    inspType == "OPC Non-PBS Site Other Inspection" ||
    inspType == "OPC Non-PBS Site Re-Inspection" ||
    inspType == "OPC PBS Site GSR Inspection" ||
    inspType == "OPC PBS Site OP Inspection" ||
    inspType == "OPC PBS Site Other Inspection" ||
    inspType == "OPC PBS Site Re-Inspection")
    {

        /*inspId 566672
        inspResult = Fail
        inspComment = null
        inspResultDate = 2/24/2022
        inspGroup = DEQ_TANKMON
        inspType = Non-PBS Tank OP Inspection
        inspSchedDate = 2/24/2022*/

        var emailParams = aa.util.newHashtable();
        var reportParams = aa.util.newHashtable();
        var reportFile = new Array();
        var alternateID = capId.getCustomID();
      
        //insps[i].getInspectionDate()
        inspModel = inspObj.getInspection();            
       
        //reportParams.put("InspectionDate",  inspObj.getInspectionDate());

        inspDate = inspObj.getInspectionDate();

        logDebug("inspResultDate: " + inspResultDate);       
        logDebug("inspection object date: " + inspObj.getInspectionDate());       
        logDebug("inspection object date: " + inspObj.getInspectionDate());       
        logDebug("alternateID: " + alternateID.toString());        
        logDebug("inspSchedDate: " + inspSchedDate);            
        var year = inspObj.getInspectionDate().getYear();
        var month = inspObj.getInspectionDate().getMonth();
        var day = inspObj.getInspectionDate().getDayOfMonth();
        var hr = inspObj.getInspectionDate().getHourOfDay()-1;
        var min = inspObj.getInspectionDate().getMinute();
        var sec = inspObj.getInspectionDate().getSecond();
             
        //logDebug("Inspection DateTime: " + month + "/" + day + "/" + year + "Hr: " +  hr + ',' + min + "," + sec);
		logDebug("Inspection DateTime: " + year + "-" + month + "/" + day + " " +  hr + ':' + min + ":" + sec + ".0");
	
		var inspectionDateCon = year + "-" + month + "/" + day + " " +  hr + ':' + min + ":" + sec + ".0";

        logDebug("capId: " + capId);
		logDebug("inspectionDateCon: " + inspectionDateCon);
        //var retVal = new Date(String(inspectionDateCon));
        //logDebug("retVal Date: " + retVal);
        addParameter(reportParams, "SiteRecordID", alternateID.toString());
        addParameter(reportParams, "InspectionDate", inspectionDateCon);
       
		rFile = generateReportBatch(capId, "Facility Inspection Summary Report", 'DEQ', reportParams)
        logDebug("This is the rFile: " + rFile);           
        
        if (rFile)
        {
           var rFiles = new Array();
           rFiles.push(rFile);

           getRecordParams4Notification(emailParams);                 
           addParameter(emailParams, "$$altID$$", capId.getCustomID());     
           sendNotification("", "ada.chan@suffolkcountyny.gov","", "DEQ_OPC_HAZARDOUS_TANK_INSPECTION", emailParams, rFiles); 
        }        
    }
} 

function sendNotification(emailFrom, emailTo, emailCC, templateName, params, reportFile)
{
	var itemCap = capId;
	if (arguments.length == 7) itemCap = arguments[6]; // use cap ID specified in args
	var id1 = itemCap.ID1;
 	var id2 = itemCap.ID2;
 	var id3 = itemCap.ID3;
	var capIDScriptModel = aa.cap.createCapIDScriptModel(id1, id2, id3);
	var result = null;
	result = aa.document.sendEmailAndSaveAsDocument(emailFrom, emailTo, emailCC, templateName, params, capIDScriptModel, reportFile);
	if(result.getSuccess())
	{
		logDebug("Sent email successfully!");
		return true;
	}
	else
	{
		logDebug("Failed to send mail. - " + result.getErrorType());
		return false;
	}
}

function debugObject(object) {
    var output = '';
    for (property in object) {
        output += "<font color=red>" + property + "</font>" + ': ' + "<bold>" + object[property] + "</bold>" + '; ' + "<BR>";
    }
    logDebug(output);
}
function generateReportBatch(itemCap, reportName, module, parameters)
{
    //returns the report file which can be attached to an email.
    var user = currentUserID; // Setting the User Name
    logDebug("user: " + user);
    logDebug("Resport Name: " + reportName);
    var report = aa.reportManager.getReportInfoModelByName(reportName);
    if (!report.getSuccess() || report.getOutput() == null)
    {
        logDebug("**WARN report generation failed, missing report or incorrect name: " + reportName);
        return false;
    }
    report = report.getOutput();
    report.setModule(module);
    report.setCapId(itemCap); //CSG Updated from itemCap.getCustomID() to just itemCap so the file would save to Record
    report.setReportParameters(parameters);

    var permit = aa.reportManager.hasPermission(reportName, user);

    if (permit.getOutput().booleanValue())
    {
        var reportResult = aa.reportManager.getReportResult(report);
        if (reportResult.getSuccess())
        {
            reportOutput = reportResult.getOutput();
            var reportFile = aa.reportManager.storeReportToDisk(reportOutput);
            reportFile = reportFile.getOutput();
            return reportFile;
        } else
        {
            logDebug("**WARN System failed get report: " + reportResult.getErrorType() + ":" + reportResult.getErrorMessage());
            return false;
        }
    } else
    {
        logDebug("You have no permission.");
        return false;
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