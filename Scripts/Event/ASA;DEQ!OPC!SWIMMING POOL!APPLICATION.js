//ASA:DEQ/OPC/SWIMMING POOL/APPLICATION


var poolTable = loadASITable("SWIMMING POOL INFORMATION", capId);
//var changeUse = getAppSpecific("Change in Use", capId);
//logDebug("Change Use: " + changeUse);
var feeEx = AInfo["Fee Exempt"];
var smCount = 0;
var medCount = 0;
var lrgCount = 0;
var modCount = 0;
var noFeeCount = 0;
var emailParams = aa.util.newHashtable();
var reportParams = aa.util.newHashtable();
var reportFile = new Array();
var conArray = getContactArray();
var conEmail = "";
var fromEmail = "";   
var capAddresses = null;  
var shortNotes = getShortNotes(capId);

// Send email to all contacts 
if (!publicUser)
{
    var s_result = aa.address.getAddressByCapId(capId);
    if(s_result.getSuccess())
    {
    capAddresses = s_result.getOutput();
    }
    logDebug("Getting emails.");

    if(matches(fromEmail, null, "", undefined))
    {
    fromEmail = "";
    }
    for (con in conArray)
    {
    if (!matches(conArray[con].email, null, undefined, ""))
    {
        logDebug("Contact email: " + conArray[con].email);
        conEmail += conArray[con].email + "; ";
    }
    }
    var lpResult = aa.licenseScript.getLicenseProf(capId);
    if (lpResult.getSuccess())
    { 
    var lpArr = lpResult.getOutput();  
    } 
    else 
    { 
    logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
    }
    for (var lp in lpArr)
    {
    if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
    {
        logDebug("LP email: " + lpArr[lp].email);
        conEmail += lpArr[lp].getEmail() + "; ";
    }
    }
    getRecordParams4Notification(emailParams);
        
    addParameter(emailParams, "$$CAPAlias$$", cap.getCapType().getAlias());
    addParameter(emailParams, "$$shortNotes$$", shortNotes);  
    addParameter(emailParams, "$$altID$$", capId.getCustomID());

    if (capAddresses != null)
    {
    logDebug("Record address:" +capAddresses[0]);
        addParameter(emailParams, "$$address$$", capAddresses[0]);
    }

    if (conEmail != null)
    {
        logDebug ("test");
        logDebug("Email addresses: " + conEmail);
        sendNotification("", conEmail, "", "DEQ_OPC_TANK_CLOSURE_APPLICATION_SUBMITTAL", emailParams, reportFile);
    }
}
voidRemoveFees("SP-CON-APP-S");
voidRemoveFees("SP-CON-APP-M");
voidRemoveFees("SP-CON-APP-L");
voidRemoveFees("SP-MOD");

if (feeEx == "No" || feeEx == null)
{
        for (var p in poolTable)
        {
            var surfaceArea = parseInt(poolTable[p]["Pool Surface Area (S.F.)"]);
		var proSco = poolTable[p]["Scope of Project"];

		if (proSco == "New Install" || proSco == "Renovation")
		{
            logDebug("Surface area is: " + surfaceArea);
            if (surfaceArea > 0 && surfaceArea <= 1000)
            {
                smCount++;
            }
            if (surfaceArea > 1000 && surfaceArea <= 1600)
            {
                medCount++;
            }
            if (surfaceArea > 1600)
            {
                lrgCount++;
            }
        }
		else if (proSco == "Modification")
		{
			modCount++;			
		}
		else
		{
			noFeeCount++;
		}
	}
        logDebug("Small total is: " + smCount);
        logDebug("Medium total is: " + medCount);
        logDebug("Large total is: " + lrgCount);
	logDebug("Modificaiton total is: " + modCount);
	logDebug("Equipment replace in kind total is: " + modCount);
        if (smCount > 0)
        {
            updateFee("SP-CON-APP-S", "DEQ_POOLAPP", "FINAL", smCount, "Y");
        }
        if (medCount > 0)
        {
            updateFee("SP-CON-APP-M", "DEQ_POOLAPP", "FINAL", medCount, "Y");
        }
        if (lrgCount > 0)
        {
            updateFee("SP-CON-APP-L", "DEQ_POOLAPP", "FINAL", lrgCount, "Y");
        }
	if (modCount > 0)
    {
		updateFee("SP-MOD", "DEQ_POOLAPP", "FINAL", modCount, "Y");
	}  
}

function voidRemoveFees(vFeeCode)
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

		if (targetFee.code.equals(vFeeCode))
			{

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

			} // each matching fee
		}  // each  fee
}  // function