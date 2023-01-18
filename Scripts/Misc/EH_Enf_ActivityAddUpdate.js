var actComplianceType = getActivityCustomFieldValue(capId,"Extend Compliance", ActivityModel.activityNumber)
if(!matches(actComplianceType,undefined,null,"")){
	if(actComplianceType == "05 Days"){
		var addComplyDays = 5;
	}else if(actComplianceType == "10 Days"){
		var addComplyDays = 10;
	}else if(actComplianceType == "30 Days"){
		var addComplyDays = 30;
	}else if(actComplianceType == "60 Days"){
		var addComplyDays = 60;
	}else if(actComplianceType == "90 Days"){
		var addComplyDays = 90;
	}
	//Update the Activity Due Date
	ActivityModel.setActDueDate(convertDate(dateAdd(null,addComplyDays)));
	aa.activity.updateActivity(ActivityModel);
	//Update any non Compliant Violation table
	if(!matches(addComplyDays,null,undefined,"")){
		showMessage = true;
		comment("<B><Font Color='RED'>WARNING:Only Violations that have not been Complied will be updated with a new Comply By Date.</Font></B>");
		
		editSpecificASITableRow(capId, "VIOLATIONS", "Complied On", "", "Comply By", dateAdd(null,addComplyDays));
		///Edit Same value on the related Permit
		//First update the Data Table
		var myTable = new Array;
		var myTable = loadASITable("VIOLATIONS",capId);
		for (x in myTable) {
			var current_row = myTable[x];
			if(!matches(current_row["Checklist Item ID"],undefined,null)){
			var GSSeqNo = current_row["Checklist Item ID"].fieldValue;
			if(!matches(current_row["Comply By"],undefined,null)){
				var complyBy = current_row["Comply By"].fieldValue;
				var GSInspId = parseInt(current_row["Inspection ID"].fieldValue);
				var permitCapId = getApplication(current_row["Permit #"].fieldValue);
				if(permitCapId){
					editSpecificASITableRowforInteger2Column(permitCapId, "VIOLATIONS", "Checklist Item ID", parseInt(GSSeqNo),"Inspection ID", parseInt(GSInspId),"Comply By", complyBy);
				}
			}
		}
	}
	//Then Update the Inspections
	var myTable2 = new Array;
	var myTable2 = loadASITable("VIOLATIONS",capId);
	var gsUpdateArr = new Array();
	for (y in myTable2) {
		var current_row2 = myTable2[y];	
		var GSSeqNo = current_row2["Checklist Item ID"].fieldValue;
		var GSInspId = parseInt(current_row2["Inspection ID"].fieldValue);
		var GSViolName = current_row2["Violation Name"].fieldValue;
		var GSComplyBy = current_row2["Comply By"].fieldValue;
		var permitCapId = getApplication(current_row["Permit #"].fieldValue);
		if(permitCapId){
			gsUpdateArr[GSSeqNo] = new Array(GSSeqNo,GSViolName,"Comply By",GSComplyBy,permitCapId);
		}
	}
	updateGuidesheetFieldValueByArrayMultiPermtAct(gsUpdateArr);
	}
}
