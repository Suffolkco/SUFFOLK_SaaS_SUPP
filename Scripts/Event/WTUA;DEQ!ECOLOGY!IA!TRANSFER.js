//WTUA:DEQ/Ecology/IA/Transfer

var pin = AInfo["PIN Number"];
var iaNumber = AInfo["IA Record Number"];

if (wftask == "Review form and check that documents are correct" && wfStatus == "Complete");
{
    var getCapResult = aa.cap.getCapIDsByAppSpecificInfoField("IA PIN Number", pin);
    if (getCapResult.getSuccess())
    {
        var apsArray = getCapResult.getOutput();
        for (aps in apsArray)
        {
            myCap = aa.cap.getCap(apsArray[aps].getCapID()).getOutput();
            logDebug("apsArray = " + apsArray);
            var relCap = myCap.getCapID();
            var relCapID = relCap.getCustomID();
        }
    }
    var getCapResult = aa.cap.getCapID(iaNumber);
    if (getCapResult.getSuccess() && matches(relCapID, iaNumber))
    {
        var wwmIA = getCapResult.getOutput();
        copyLicenseProfessional(capId, wwmIA);

    }
}