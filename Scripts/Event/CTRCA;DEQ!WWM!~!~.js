//CTRCA:DEQ/WWM/*/*
applicationSubmittedWWM();

var ACAInitiated = getAppSpecific("Originally created in ACA");
logDebug("Originally created in ACA"+ ACAInitiated);
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
//var body = "feeEx: " + feeEx + "removeFee: " + removeFee;
//aa.sendMail("noreplyehims@suffolkcountyny.gov","ada.chan@suffolkcountyny.gov", "", "CTRCA Debug Info", body);


function voidRemoveAllFees()
	{
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
                { logDebug( "**ERROR: voiding fee item (" + targetFee.code + "): " + editResult.getErrorMessage()); return false; }

            var feeSeqArray = new Array();
            var paymentPeriodArray = new Array();

            feeSeqArray.push(targetFee.sequence);
            paymentPeriodArray.push(targetFee.period);
            var invoiceResult_L = aa.finance.createInvoice(itemCap, feeSeqArray, paymentPeriodArray);

            if (!invoiceResult_L.getSuccess())
            {
                logDebug("**ERROR: Invoicing the fee items voided " + thisFee.code + " was not successful.  Reason: " +  invoiceResult_L.getErrorMessage());
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
                { logDebug( "**ERROR: removing fee item (" + targetFee.code + "): " + editResult.getErrorMessage()); return false; }
            
        }
    }  // each  fee
}  // function