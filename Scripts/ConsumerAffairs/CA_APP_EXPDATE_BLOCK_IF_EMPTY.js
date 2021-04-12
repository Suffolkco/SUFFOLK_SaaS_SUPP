//Block License Issuance if Expiration Date is Empty
showDebug = true;

var expDate = AInfo["Expiration Date"];

if (wfTask == "Issuance" && wfStatus == "Issued")
{
    logDebug("expDate is: " + expDate);
    if (matches(expDate, "", null, undefined))
        {
            cancel = true;
            showMessage = true;
            comment("In order to issue a License, an expiration date must be provided.");
        }

}