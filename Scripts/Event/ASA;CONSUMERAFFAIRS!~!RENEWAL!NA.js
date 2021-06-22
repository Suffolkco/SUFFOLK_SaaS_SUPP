// ASA;CONSUMERAFFAIRS!~!RENEWAL!NA

var vGoodToRenew;
var vOrgCapId;

//Setup/Check renewal
vGoodToRenew = prepareRenewal();
if (parentCapId != null && vGoodToRenew)
{
    //copy ASI Info from license to renewal
    copyASIInfo(parentCapId, capId);

    //Copy ASIT from license to renewal
    copyASITables(parentCapId, capId);

    //Copy Contacts from license to renewal
    copyContacts3_0(parentCapId, capId);
}
//End Core Renewal Functionality