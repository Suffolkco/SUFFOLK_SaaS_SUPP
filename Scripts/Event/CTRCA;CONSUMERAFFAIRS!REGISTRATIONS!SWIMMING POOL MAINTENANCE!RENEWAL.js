
aa.cap.updateAccessByACA(capId, "Y");

include("CA_REN_TO_LIC_SUBMITTAL");

if (!publicUser)
{
    addFee("LIC_REN_01", "CA_LIC_REN", "FINAL", 1, "Y")
}