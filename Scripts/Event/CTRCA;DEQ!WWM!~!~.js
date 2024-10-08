//CTRCA:DEQ/WWM/*/*
if (!appMatch("DEQ/WWM/SHIP/Application"))
{
    applicationSubmittedWWM();
}

var ACAInitiated = getAppSpecific("Originally created in ACA");
logDebug("Originally created in ACA" + ACAInitiated);
editAppSpecific("Originally created in ACA", "Yes");

//var removeFee;

if (!publicUser) // VOID fees if it's fee exempt.
{
    var feeEx = getAppSpecific("Fee Exempt");
    if (feeEx == "Yes")
    {
        voidRemoveAllFees();
    }
}

// EHIMS-5309: Timeout set delay for report to load
if (!appMatch("DEQ/WWM/SHIP/Application"))
{    
    var executor = new java.util.concurrent.Executors.newScheduledThreadPool(1);

    var runnable = new JavaAdapter(java.lang.Runnable, {

      run: function sendPin() {
            // Send additional PIN information for contacts
        var capPeoples = getPeople(capId)
        var shortNotes = getShortNotes(capId);
                  
            for (loopk in capPeoples)
            {
                cont = capPeoples[loopk];                 
                peop = cont.getPeople();
                conEmail = peop.getEmail();
                var reportFile = new Array();	
                var reportParams1 = aa.util.newHashtable();
                var emailParams1 = aa.util.newHashtable();
                logDebug("Found contact email: " + conEmail);
                // Local contact ID
                localCId = cont.getCapContactModel().getPeople().getContactSeqNumber();						
                contactType = cont.getCapContactModel().getPeople().getContactType();
                
                logDebug("localCId: " + localCId);	
                logDebug("contactType: " + contactType);	
                
        
                var altID = capId.getCustomID();
                logDebug("altid: " + altID);	
                
                        
                reportParams1.put("ContactID", localCId);
                reportParams1.put("RecordID", altID.toString());
                reportParams1.put("ContactType", contactType);			
        
                
                rFile = generateReport("ACA Registration Pins-WWM",reportParams1, appTypeArray[0]);
        
                logDebug("This is the ACA Pin File: " + rFile); 
                if (rFile) {
                    reportFile.push(rFile);
                }
        
                getRecordParams4Notification(emailParams1);	
                addParameter(emailParams1, "$$altID$$", capId.getCustomID());	
                addParameter(emailParams1, "$$shortNotes$$", shortNotes);					
                if (conEmail != null)
                {
                    sendNotification("", conEmail, "", "DEQ_WWM_APPLICATION SUBMITTAL", emailParams1, reportFile);
                }					
                    
            }
        }     
    });

    executor.schedule(runnable, (5 * 1000), java.util.concurrent.TimeUnit.MILLISECONDS);

}



//var body = "feeEx: " + feeEx + "removeFee: " + removeFee;
//aa.sendMail("noreplyehims@suffolkcountyny.gov","ada.chan@suffolkcountyny.gov", "", "CTRCA Debug Info", body);


function voidRemoveAllFees() {
    var feeSeqArray = new Array();
    var invoiceNbrArray = new Array();
    var feeAllocationArray = new Array();
    var itemCap = capId;
    if (arguments.length > 1)
        itemCap = arguments[1];

    // for each fee found
    //  	  if the fee is "NEW" remove it
    //  	  if the fee is "INVOICED" void it and invoice the void
    //
    // This was coded by sCube, probably because in ACA pageflow, users can go back
    // to previous steps and we don't want the fees keeps adding. That's why we void
    // the remove fees to avoid duplicate fees

    var targetFees = loadFees(itemCap);

    for (tFeeNum in targetFees)
    {
        targetFee = targetFees[tFeeNum];

        // only remove invoiced or new fees, however at this stage all AE fees should be invoiced.
        if (targetFee.status == "INVOICED")
        {
            var editResult = aa.finance.voidFeeItem(itemCap, targetFee.sequence);

            if (editResult.getSuccess())
                logDebug("Voided existing Fee Item: " + targetFee.code);
            else
            {logDebug("**ERROR: voiding fee item (" + targetFee.code + "): " + editResult.getErrorMessage()); return false;}

            var feeSeqArray = new Array();
            var paymentPeriodArray = new Array();

            feeSeqArray.push(targetFee.sequence);
            paymentPeriodArray.push(targetFee.period);
            var invoiceResult_L = aa.finance.createInvoice(itemCap, feeSeqArray, paymentPeriodArray);

            if (!invoiceResult_L.getSuccess())
            {
                logDebug("**ERROR: Invoicing the fee items voided " + thisFee.code + " was not successful.  Reason: " + invoiceResult_L.getErrorMessage());
                return false;
            }
        }
        if (targetFee.status == "NEW")
        {
            // delete the fee
            var editResult = aa.finance.removeFeeItem(itemCap, targetFee.sequence);

            if (editResult.getSuccess())
                logDebug("Removed existing Fee Item: " + targetFee.code);
            else
            {logDebug("**ERROR: removing fee item (" + targetFee.code + "): " + editResult.getErrorMessage()); return false;}

        }
    }  // each  fee
}  // function