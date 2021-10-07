// ASA;CONSUMERAFFAIRS!LICENSES!HOME IMPROVEMENT!RENEWAL

//showDebug = 1;
//logDebug("Entering Renew ASA");

//aa.runScriptInNewTransaction("APPLICATIONSUBMITAFTER4RENEW");
//aa.runScript("APPLICATIONSUBMITAFTER4RENEW");


 

var conArray = getContactArray(capId);

if (conArray.length < 1) 
{
    var addChild = aa.cap.createRenewalCap(parentCapId, capId, true);
    aa.cap.updateAccessByACA(capId, "Y");
    /*if (publicUser)
    {
        //copying the contacts from the parent to the renewal record when beginning the renewal for ACA records only
        var capContacts = aa.people.getCapContactByCapID(parentCapId);
        if (capContacts.getSuccess())
        {
            capContacts = capContacts.getOutput();
            logDebug("capContacts: " + capContacts);
            for (var yy in capContacts)
            {
                aa.people.removeCapContact(parentCapId, capContacts[yy].getPeople().getContactSeqNumber());
            }
        }

        
    }*/
    copyContacts(parentCapId, capId);

    AInfo = new Array();
    loadAppSpecific(AInfo, parentCapId);
    for (asi in AInfo)
    {
        //Check list
        logDebug("ASI: " + asi + " value is:" + AInfo[asi]);
        editAppSpecificLOCAL(asi, AInfo[asi], capId);
    }

    var tableCopy = 0;
    if (tableCopy == 0)
    {
        copyASITables(parentCapId, capId);
        tableCopy = tableCopy + 1;
    }
    //copyAddresses(parentCapId, capId); 
    copyParcels(parentCapId, capId); 
    copyParcelGisObjects();

    var dryCleanerExempt = checkForFee(parentCapID, "LIC_25")

    if (!dryCleanerExempt)
    {
        addfee("DC_REN_01", "CA_LIC_REN_DC", "FINAL", 1, "Y")
    } 


}



function editAppSpecificLOCAL(itemName, itemValue)  // optional: itemCap
{
    var itemCap = capId;
    var itemGroup = null;
    if (arguments.length == 3) itemCap = arguments[2]; // use cap ID specified in args

    if (useAppSpecificGroupName)
    {
        if (itemName.indexOf(".") < 0)
        { logDebug("**WARNING: (editAppSpecific) requires group name prefix when useAppSpecificGroupName is true"); return false }


        itemGroup = itemName.substr(0, itemName.indexOf("."));
        itemName = itemName.substr(itemName.indexOf(".") + 1);
    }
    // change 2/2/2018 - update using: aa.appSpecificInfo.editAppSpecInfoValue(asiField)
    // to avoid issue when updating a blank custom form via script. It was wiping out the field alias 
    // and replacing with the field name

    var asiFieldResult = aa.appSpecificInfo.getByList(itemCap, itemName);
    if (asiFieldResult.getSuccess())
    {
        var asiFieldArray = asiFieldResult.getOutput();
        if (asiFieldArray.length > 0)
        {
            var asiField = asiFieldArray[0];
            if (asiField)
            {
                var origAsiValue = asiField.getChecklistComment();
                asiField.setChecklistComment(itemValue);

                var updateFieldResult = aa.appSpecificInfo.editAppSpecInfoValue(asiField);
                if (updateFieldResult.getSuccess())
                {
                    logDebug("Successfully updated custom field on record: " + itemCap.getCustomID() + " on " + itemName + " with value: " + itemValue);
                    if (arguments.length < 3) //If no capId passed update the ASI Array
                        AInfo[itemName] = itemValue;
                }
                else
                { logDebug("WARNING: (editAppSpecific) " + itemName + " was not updated."); }
            }
            else
            { logDebug("WARNING: (editAppSpecific) " + itemName + " was not updated."); }
        }
    }
    else
    {
        logDebug("ERROR: (editAppSpecific)" + asiFieldResult.getErrorMessage());
    }
}
function checkForFee(pCapId, pFeeCode)
{

    logDebug("pCapId: " + pCapId.getCustomID());

    var checkStatus = false;

    var statusArray = ["NEW", "INVOICED"];

    var feeResult = aa.fee.getFeeItems(pCapId);

    var feeObjArr;

    var x = 0;

    if (feeResult.getSuccess())
{

        feeObjArr = feeResult.getOutput();

    } else
{

        logDebug("**ERROR: getting fee items: " + capContResult.getErrorMessage());

        return false

    }

    for (x in feeObjArr)
{

        var vFee = feeObjArr[x];

        var y = 0;

        logDebug("feeObjArr[x].getFeeCod(): " + feeObjArr[x].getFeeCod());

        logDebug("feeObjArr[x].getF4FeeItemModel().feeNotes: " + feeObjArr[x].getF4FeeItemModel().feeNotes);

        logDebug("feeObjArr[x].getFeeitemStatus(): " + feeObjArr[x].getFeeitemStatus());

        if (pFeeCode == feeObjArr[x].getFeeCod() && exists(feeObjArr[x].getFeeitemStatus(), statusArray))
{

            return true;

        }

        /*if (pFeeCode == feeObjArr[x].getFeeCod() && pFeeComment == feeObjArr[x].getF4FeeItemModel().feeNotes && exists(feeObjArr[x].getFeeitemStatus(), statusArray))

        {

            return true;

        }*/

    }

    return false;

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
                { logDebug("**ERROR: voiding fee item (" + targetFee.code + "): " + editResult.getErrorMessage()); return false; }

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
                { logDebug("**ERROR: removing fee item (" + targetFee.code + "): " + editResult.getErrorMessage()); return false; }

            }

        } // each matching fee
    }  // each  fee
}  // function