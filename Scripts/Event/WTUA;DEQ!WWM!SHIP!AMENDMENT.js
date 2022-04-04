var parent = parentCapId.getCustomId();


if (wfTask == "Submission Review" && wfStatus == "SHIP Record Complete")
{
    var desc = "Automated via:" + capIDString;
    var wwmIA = createChild('DEQ', 'Ecology', 'IA', 'Application', desc);
    editAppSpecificLOCAL("WWM Application Number", parent, wwmIA);
    copyAddress(capId, wwmIA);
    copyContactsByType(capId, wwmIA, ["Property Owner"]);
    copyContactsByType(capId, wwmIA, ["Agent"]);
    copyParcel(capId, wwmIA);
    copyLicensedProfByType(capId, wwmIA, ["IA Installer"]);
    copyLicensedProfByType(capId, wwmIA, ["IA Service Provider"]);
    copyLicensedProfByType(capId, wwmIA, ["IA Designer"]);
}


