// POST_Update_Record_Hierarchy.js
var SCRIPT_VERSION = "1.0";

updateRecordHierarchy(capId);

function updateRecordHierarchy(capId) {
    var permitCapId = getCapId();
    var facilityParent = getFacilityParent(capId);

    if (facilityParent) {
        // Make the facility record the parent of the permit record
        aa.cap.createAppHierarchy(facilityParent, permitCapId);
        logDebug("Facility Record remains the parent, Permit Record becomes a child under the Facility Record.");

        // Remove the existing relationship between application and facility records
        aa.cap.removeAppHierarchy(capId, facilityParent);
        logDebug("Removed the relationship between Application Record and Facility Record.");

        // Make the application record a child under the permit record
        aa.cap.createAppHierarchy(permitCapId, capId);
        logDebug("Application Record becomes a child under the Permit Record.");
    } else {
        logDebug("No Facility Record is found as a parent.");
    }
}

function getFacilityParent(capId) {
    var parentResult = aa.cap.getProjectByChildCapID(capId, "Parent", null);
    if (parentResult.getSuccess()) {
        var parents = parentResult.getOutput();
        for (var i in parents) {
            var parentCapId = parents[i].getProjectID();
            var parentCap = aa.cap.getCap(parentCapId).getOutput();
            var parentCapModel = parentCap.getCapModel();
            var parentCapType = parentCapModel.getCapType().toString();

            if (parentCapType == "EnvHealth/Facility/NA/NA") {
                return parentCapId;
            }
        }
    }
    return null;
}