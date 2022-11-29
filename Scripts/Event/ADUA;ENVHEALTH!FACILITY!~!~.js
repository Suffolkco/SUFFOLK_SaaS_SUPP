// Find Parent Facility and update current record with Facility Name and ID
var facilityID = capId;
var aryChildren = new Array;
aryChildren = getChildren("EnvHealth/*/*/*",facilityID);
for(x in aryChildren){
    var childCapId = aryChildren[x];
    updateFacilityInfo(childCapId,facilityID);
    var aryGrandChildren = getChildren("EnvHealth/*/*/*",childCapId);
    for(x in aryGrandChildren){
        var grandChildCapId = aryGrandChildren[x];
        updateFacilityInfo(grandChildCapId,facilityID);
    }
}
