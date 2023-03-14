// Find Parent Facility and update current record with Facility Name and ID
var facilityID = capId;
var parentProjectName = aa.cap.getCap(facilityID).getOutput().specialText;
editAppName(parentProjectName);
var aryChildren = getChildren("EnvHealth/*/*/*",facilityID);
for(x in aryChildren){
    var childCapId = aryChildren[x];
    updateFacilityInfo(childCapId,facilityID);
    editAppName(parentProjectName, childCapId);
    var aryGrandChildren = getChildren("EnvHealth/*/*/*",childCapId);
    for(x in aryGrandChildren){
        var grandChildCapId = aryGrandChildren[x];
        updateFacilityInfo(grandChildCapId,facilityID);
        editAppName(parentProjectName, grandChildCapId);
    }
}

editAppSpecific("Facility Name",parentProjectName);

