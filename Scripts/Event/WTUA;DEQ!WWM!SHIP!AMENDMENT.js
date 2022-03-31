
if (wfStatus == "Submission Review" && wfStatus == "SHIP Record Complete")
{
    var desc = "Automated via:" + capIDString;
    var wwmIA = createChild('DEQ', 'Ecology', 'IA', 'Application', desc);
    copyAppSpecificInfo(capId, wwmIA);
}