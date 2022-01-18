//ISA;DEQ!WWM!~!Application
showDebug = true;

var inspections = aa.inspection.getInspections(capId);
if (inspections.getSuccess()) 
{
    insps = inspections.getOutput();
	
	logDebug("Inspection length is: " + insps.length);
	
	for (var i = 0; i < insps.length; i++) 
	{
        logDebug("Inspection Type is: " + insps[i].getInspectionType());
		
		if (insps[i].getInspectionType() == "WWM_RES_System 1")
		{			
			var inspModel = insps[i].getInspection();
			inspModel.setins
			//schDate = insps[i].getScheduledDate();
			inspSchedDate = insps[i].getScheduledDate().getYear() + "-" + insps[i].getScheduledDate().getMonth() + "-" + insps[i].getScheduledDate().getDayOfMonth()
			logDebug("Schedule Date: " + inspSchedDate);	   
			reqDate = insps[i].getRequestDate().getYear() + "-" + insps[i].getRequestDate().getMonth() + "-" + insps[i].getRequestDate().getDayOfMonth()
			logDebug("Request Date:" + reqDate);

			var year = insps[i].getInspectionDate().getYear();
			var month = insps[i].getInspectionDate().getMonth() - 1;
			var hr = insps[i].getInspectionDate().getHourOfDay();
			var min = insps[i].getInspectionDate().getMinute();
			var sec = insps[i].getInspectionDate().getSecond();
			logDebug("year, month, day, hr, min, sec:" + year + "," + month + "," + day + "," + hr + "," + min + "," + sec);
			var newDate = new Date(year, month, day, hr, min, sec);
			logDebug("newDate:" + newDate);

			inspId = insps[i].getIdNumber();
			logDebug("Inspection id: " + inspId);
			inspSeq = insps[i].getSequenceNumber();
			logDebug("Inspection Seq Number: " + inspSeq);
			inspector = insps[i].getInspector();
			logDebug("Inspector: " + inspector);
			inspStatus = insps[i].getinsepctionStatus();
			logDebug("Inspection Status: " + inspStatus);
			
			//insps[i].setInspectionStatus("Scheduled");

			//aa.inspection.editInspection(insps[i]);

			//iObj.setInspector(inspectorObj)

			/*assignResult = aa.inspection.editInspection(insps[i])

			if (!assignResult.getSuccess())
				{ logDebug("**ERROR re-assigning inspection " + assignResult.getErrorMessage()) ; return false ; }
			else
				logDebug("Successfully reassigned inspection " + iObj.getInspectionType() + " to user " + inspectorObj.getUserID());
				*/
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