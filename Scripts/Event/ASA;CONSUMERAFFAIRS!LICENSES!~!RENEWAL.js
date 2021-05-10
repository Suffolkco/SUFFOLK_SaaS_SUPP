// ASA;CONSUMERAFFAIRS!LICENSES!HOME IMPROVEMENT!RENEWAL

//showDebug = 1;
//logDebug("Entering Renew ASA");

aa.runScriptInNewTransaction("APPLICATIONSUBMITAFTER4RENEW");
aa.runScript("APPLICATIONSUBMITAFTER4RENEW");


var addChild = aa.cap.createRenewalCap(parentCapId, capId, true);

aa.cap.updateAccessByACA(capId, "N");
if (publicUser)
{
    //copying the contacts from the parent to the renewal record when beginning the renewal for ACA records only
    copyContacts(parentCapId, capId);
    copyASIFields(parentCapId, capId);
    copyASITables(parentCapId, capId);
}

// Only run the below script on this ASA event when submitted from AA          
include("CA_REN_TO_LIC_UPDATE_AA_COPY");

