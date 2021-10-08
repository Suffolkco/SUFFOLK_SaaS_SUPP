//CTRCA

include("CA_REN_TO_LIC_SUBMITTAL");

aa.cap.updateAccessByACA(capId, "Y");

if (!publicUser)
{
    if (!appMatch("ConsumerAffairs/Licenses/Dry Cleaning/Renewal"))
    {
        logDebug("app is not Dry Cleaning");
        addFee("LIC_REN_01", "CA_LIC_REN", "FINAL", 1, "Y");
        logDebug("Added Renewal Fee");
    }
    if (appMatch("ConsumerAffairs/Licenses/Dry Cleaning/Renewal"))
    {
        logDebug("app is Dry Cleaning");
        var dryCleanerExempt = checkForFee(parentCapId, "LIC_25")


        if (!dryCleanerExempt) 
        {
            logDebug("should not be exempt from fee");
            addFee("LIC_REN_01", "CA_LIC_REN", "FINAL", 1, "Y")
            logDebug("Added Renewal Fee")
        }
    }
}