//Block License Issuance if Expiration Date is Empty
showDebug = false;

var expDate = AInfo["Issued Date"];

if (wfTask == "Issuance" && wfStatus == "Issued")
{
    logDebug("expDate is: " + expDate);
    if (matches(expDate, "", null, undefined))
        {
            cancel = true;
            showMessage = true;
            comment("In order to issue a License, an issued date must be provided.");
        }

}