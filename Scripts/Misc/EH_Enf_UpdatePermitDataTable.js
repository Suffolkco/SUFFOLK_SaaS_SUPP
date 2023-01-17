// Update the Enforcement Violation Tables with the Permit Violation Table
var myTable = new Array;
var fieldValsArray = new Array;
var myTable = loadASITable("VIOLATIONS",capId);
if (myTable != null) {
    for (x in myTable) {
        var current_row = myTable[x];
        var GSInspId = current_row["Inspection ID"].fieldValue;
        permitCapId = getApplication(current_row["Permit #"].toString());
        if(!matches(current_row["Checklist Item ID"],undefined,null)){
            var GSSeqNo = current_row["Checklist Item ID"].fieldValue;
            var tblStatus = current_row["Status"].fieldValue;
            var degree = current_row["Degree"].fieldValue;
            var obsDate = current_row["Observed Date"].fieldValue;
            var complyBy = current_row["Comply By"].fieldValue;
            var complyOn = current_row["Complied On"].fieldValue;
            var complyType = current_row["Compliance Type"].fieldValue;
            var checklistCom = current_row["Checklist Comment"].fieldValue;
            editSpecificASITableRowforInteger2Column(permitCapId, "VIOLATIONS", "Checklist Item ID", GSSeqNo,"Inspection ID", GSInspId,"Status", tblStatus);
            editSpecificASITableRowforInteger2Column(permitCapId, "VIOLATIONS", "Checklist Item ID", GSSeqNo,"Inspection ID", GSInspId,"Degree", degree);
            editSpecificASITableRowforInteger2Column(permitCapId, "VIOLATIONS", "Checklist Item ID", GSSeqNo,"Inspection ID", GSInspId,"Observed Date", obsDate);
            editSpecificASITableRowforInteger2Column(permitCapId, "VIOLATIONS", "Checklist Item ID", GSSeqNo,"Inspection ID", GSInspId,"Comply By", complyBy);
            editSpecificASITableRowforInteger2Column(permitCapId, "VIOLATIONS", "Checklist Item ID", GSSeqNo,"Inspection ID", GSInspId,"Complied On", complyOn);
            editSpecificASITableRowforInteger2Column(permitCapId, "VIOLATIONS", "Checklist Item ID", GSSeqNo,"Inspection ID", GSInspId,"Compliance Type", complyType);
            editSpecificASITableRowforInteger2Column(permitCapId, "VIOLATIONS", "Checklist Item ID", GSSeqNo,"Inspection ID", GSInspId,"Checklist Comment", checklistCom);
        }
    }
}
