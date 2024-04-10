// ASA;CONSUMERAFFAIRS!WEIGHT AND MEASURES!~!RENEWAL

var conArray = getContactArray(capId);

if (conArray.length < 1) {
    var addChild = aa.cap.createRenewalCap(parentCapId, capId, true);
    aa.cap.updateAccessByACA(capId, "Y");    
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
}

try{  
    
    if (appMatch("ConsumerAffairs/Weights and Measures/Motor Fuel Distributor/Renewal"))
    {
        updateFee("WM_12", "CAPOS_WT_MRS", "FINAL", 1, "Y");	     
    }
    else if (appMatch("ConsumerAffairs/Weights and Measures/Motor Fuel Retailer/Renewal"))
    {
        updateFee("WM_12", "CAPOS_WT_MRS", "FINAL", 1, "Y");	     
    }

    if(!publicUser)
    {
        footage =getAppSpecific("Gross Square Footage of Store", capId);
        logDebug("This is the value for AA Gross Square Footage of Store: " + footage);
    }
    else
    {
        footage = AInfo["Gross Square Footage of Store"];
        logDebug("This is the value for Gross Square Footage of Store: " + footage);
    }                   


    if (!matches(footage, null, undefined, ""))
    {
        logDebug("footage: " + parseInt(footage));

        if (parseInt(footage) <= 3000)
        {
            updateFee("IPW_WM_W1", "CAPOS_WT_MRS", "FINAL", 1, "Y");		
            
        }
        else if (parseInt(footage) > 3000 && parseInt(footage) <= 10000)
        {
            updateFee("IPW_WM_W2", "CAPOS_WT_MRS", "FINAL", 1, "Y");		
        }
        else if (parseInt(footage) > 10000 && parseInt(footage) <= 30000)
        {
            updateFee("IPW_WM_W3", "CAPOS_WT_MRS", "FINAL", 1, "Y");
            
        }
        else if (parseInt(footage) > 30000 && parseInt(footage) <= 90000)
        {
            updateFee("IPW_WM_W4","CAPOS_WT_MRS",  "FINAL", 1, "Y");		
            
        }
        else if (parseInt(footage) > 90000)
        {

            updateFee("IPW_WM_W5", "CAPOS_WT_MRS", "FINAL", 1, "Y");
        }
        
        
	}
}catch (err){
 	logDebug("A JavaScript Error occurred: ASA;CONSUMERAFFAIRS!LICENSES!~!RENEWAL: Add fees: " + err.message);
	logDebug(err.stack);
}


function getAppStatus(pcapId) {
	var itemCap = pcapId;
	
	var appStatus = null;
   var capResult = aa.cap.getCap(itemCap);
   if (capResult.getSuccess()) {
      licCap = capResult.getOutput();
      if (licCap != null) {
         appStatus = "" + licCap.getCapStatus();
      }
   } else {
		logDebug("ERROR: Failed to get app status: " + capResult.getErrorMessage());
	}
	return appStatus;
}

function checkForFee(pCapId, pFeeCode){
try{
	logDebug("pCapId: " + pCapId.getCustomID());
	var checkStatus = false;
	var statusArray = ["NEW", "INVOICED"];
	var feeResult = aa.fee.getFeeItems(pCapId);
	var feeObjArr;
	var x = 0;
	if (feeResult.getSuccess()){
		feeObjArr = feeResult.getOutput();
	}else{
		logDebug("**ERROR: getting fee items: " + capContResult.getErrorMessage());
		return false
	}
	for (x in feeObjArr){
		var vFee = feeObjArr[x];
		var y = 0;
		logDebug("feeObjArr[x].getFeeCod(): " + feeObjArr[x].getFeeCod());
		logDebug("feeObjArr[x].getF4FeeItemModel().feeNotes: " + feeObjArr[x].getF4FeeItemModel().feeNotes);
		logDebug("feeObjArr[x].getFeeitemStatus(): " + feeObjArr[x].getFeeitemStatus());
		if (pFeeCode == feeObjArr[x].getFeeCod() && exists(feeObjArr[x].getFeeitemStatus(), statusArray)){
			return true;
		}
		/*if (pFeeCode == feeObjArr[x].getFeeCod() && pFeeComment == feeObjArr[x].getF4FeeItemModel().feeNotes && exists(feeObjArr[x].getFeeitemStatus(), statusArray))
		{
			return true;
		}*/
	}
	return false;
}catch (err){
 	logDebug("A JavaScript Error occurred: ASA;CONSUMERAFFAIRS!LICENSES!~!RENEWAL: checkForFee: " + err.message);
	logDebug(err.stack);
}}

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
