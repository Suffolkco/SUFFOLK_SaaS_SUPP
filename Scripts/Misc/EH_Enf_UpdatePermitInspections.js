// Update any Inspection Records on the Parent from the Record Data Table
var parentFacilityID = getFacilityId(capId);
var myTable = new Array;
var myTable = loadASITable("VIOLATIONS",capId);
var gsUpdateArr = new Array();
for (y in myTable) {
    var current_row2 = myTable[y];	
    var GSSeqNo = current_row2["Checklist Item ID"].fieldValue;
    var GSInspId = parseInt(current_row2["Inspection ID"].fieldValue);
    var GSViolName = current_row2["Violation Name"].fieldValue;
    var GSViolDegree = current_row2["Degree"].fieldValue;
    var GSViolStatus = current_row2["Status"].fieldValue;
    var GSComplyBy = current_row2["Comply By"].fieldValue;
    var GSCompliedOn = current_row2["Complied On"].fieldValue;
    var GSComplianceType = current_row2["Compliance Type"].fieldValue;
    permitCapId = getApplication(current_row2["Permit #"].fieldValue);
	var UniqueId = GSInspId + GSSeqNo;
    if(permitCapId){
        updateGuidesheetItemStatus(GSInspId, GSViolName, GSViolStatus, permitCapId);
        gsUpdateArr[UniqueId] = new Array(GSSeqNo,GSViolName,"Return to Compliance Date",GSCompliedOn,"Return to Compliance Qualifier",GSComplianceType,"Comply By",GSComplyBy,permitCapId,GSInspId);
    }
}
updateGuidesheetFieldValueByArrayMultiPermt(gsUpdateArr);
