
aa.cap.updateAccessByACA(capId, "Y");

include("CA_REN_TO_LIC_SUBMITTAL");

logDebug("appTypeArray[1]: " + appTypeArray[1]);

(!publicUser)
{
    if (matches(appTypeArray[1], "Licenses"))     
    {
    addFee("LIC_REN_01", "CA_LIC_REN", "FINAL", 1, "Y")
    }
} 