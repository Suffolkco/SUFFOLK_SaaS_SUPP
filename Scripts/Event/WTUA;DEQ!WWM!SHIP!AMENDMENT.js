
var AInfo = new Array();
var wwmID = getParentLicenseCapID(capId)
logDebug ("wwmID = " + wwmID);

if (wfStatus == "Submission Review" && wfStatus == "SHIP Record Complete")
{
    var desc = "Automated via:" + capIDString;
    var wwmIA = createChild('DEQ', 'Ecology', 'IA', 'Application', desc);
    editAppSpecificLOCAL("WWM Application Number", wwmID, wwmIA);
}