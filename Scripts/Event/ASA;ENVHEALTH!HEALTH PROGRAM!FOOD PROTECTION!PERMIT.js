// ASA_Update_Record_Hierarchy_Permit.js
var SCRIPT_VERSION = "1.0";

// Event: ASA
// Trigger: Application Submit After
// This script ensures that when a permit record is created from an application record with a facility parent, the facility record remains the parent, the permit record becomes a child under the facility, and the application becomes a child under the permit.

var applicationCapId = getApplicationParent(capId);
if (applicationCapId) {
    var facilityParent = getFacilityParent(applicationCapId);

    if (facilityParent) {
        // Make the facility record the parent of the permit record
        aa.cap.createAppHierarchy(facilityParent, capId);
        logDebug("Facility Record remains the parent, Permit Record becomes a child under the Facility Record.");

        // Remove the existing relationship between application and facility records
        aa.cap.removeAppHierarchy(applicationCapId, facilityParent);
        logDebug("Removed the relationship between Application Record and Facility Record.");

        // Make the application record a child under the permit record
        aa.cap.createAppHierarchy(capId, applicationCapId);
        logDebug("Application Record becomes a child under the Permit Record.");
    } else {
        logDebug("No Facility Record is found as a parent.");
    }
} else {
    logDebug("No Application Record found as a parent.");
}

function getFacilityParent(capId) {
    // The same function as in the previous script
}

function getApplicationParent(capId) {
    var parentResult = aa.cap.getProjectByChildCapID(capId, "Parent", null);
    if (parentResult.getSuccess()) {
        var parents = parentResult.getOutput();
        if (parents.length > 0) {
            return parents[0].getProjectID();
        }
    }
    return null;
}