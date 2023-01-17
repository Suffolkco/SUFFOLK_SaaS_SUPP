//ASB:ADMINISTRATION/BILLING/PARAMETERS/NA

// Validate The ALT that is to be used
var billingKey = AInfo["Billing Key"];
var billingMonth = AInfo["Billing Month"];
var billingSched = AInfo["Billing Schedule"];
var billMonthNum=billingMonth.substr(0,2);
if(billingKey.length > 10){
    showMessage = true;
    cancel = true;
    comment("<B><Font Color=RED>The Billing Key specified, " + billingKey + " is to long and needs to be 10 chars or less. Please choose a different Billing Key</Font></B>");
}
switch(String(billingSched)){
    case "Annual":
        var billSched = "ANN";
        break;
    case "Bi-Annual":
        var billSched = "BIANN";
        break;
    case "Monthly":
        var billSched = "MNTH";
        break;
    case "Quarterly":
        var billSched = "QRT";
        break;
    case "Semi-Annual":
        var billSched = "SEMIANN";
        break;
    default: break;
}
var today = new Date();
var todaysYear = today.getFullYear();
var newAltID = billingKey + "_" + billMonthNum + "_" + todaysYear + "_" + billSched;
if (newAltID != null && newAltID != "") {
    duplicateCheck = aa.cap.getCapID(newAltID).getOutput();
    if(duplicateCheck != null){
        showMessage = true;
        cancel = true;
        comment("<B><Font Color=RED>The Billing Key specified, " + newAltID + " is already in use and cannot be used again. Please choose a different Billing Key</Font></B>");
    }
}
