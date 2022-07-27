//ASA:DEQ/OPC/ENFORCEMENT/NA

if (currentUserID == "RLITTLEFIELD")
{
    showDebug = true;
}


var parcelRecs = capIdsGetByParcel();
logDebug("caps by parcel: " + parcelRecs);

for (pr in parcelRecs)
{
    logDebug("parcelrec is: " + parcelRecs[pr]);
    logDebug("parcelrec captype is: " + aa.cap.getCap(parcelRecs[pr]).getOutput().getCapType());
    var parcelRecCapType = aa.cap.getCap(parcelRecs[pr]).getOutput().getCapType();

    if (parcelRecCapType == "DEQ/General/Site/NA")
    {
        var linkResult = aa.cap.createAppHierarchy(parcelRecs[pr], capId);
        if (linkResult.getSuccess())
        {
            logDebug("Successfully linked to Parent Application : " + parcelRecs[pr]);
        }
        else
        {
            logDebug("**ERROR: linking to parent application parent cap id (" + parcelRecs[pr] + "): " + linkResult.getErrorMessage());
        }
    }
    else if (parcelRecCapType == "DEQ/OPC/Hazardous Tank/Permit")
    {
        var tankParent = getParentByCapId(parcelRecs[pr]);
        logDebug("tank parent is: " + tankParent);
        var linkResult = aa.cap.createAppHierarchy(tankParent, capId);
        if (linkResult.getSuccess())
        {
            logDebug("Successfully linked to Parent Application : " + tankParent);
        }
        else
        {
            logDebug("**ERROR: linking to parent application parent cap id (" + tankParent + "): " + linkResult.getErrorMessage());
        }
    }
}