//CTRCA

include("CA_REN_TO_LIC_SUBMITTAL");

aa.cap.updateAccessByACA(capId, "Y");

if (!publicUser)
{
    if (!appMatch("ConsumerAffairs/Licenses/Dry Cleaning/Renewal") && !appMatch("ConsumerAffairs/Licenses/Restricted Electrical/Renewal") && !appMatch("ConsumerAffairs/Licenses/Restricted Plumbing/Renewal"))
    {
        logDebug("app is not Dry Cleaning");
        addFee("LIC_REN_01", "CA_LIC_REN", "FINAL", 1, "Y");
        logDebug("Added Renewal Fee");
    }
    if (appMatch("ConsumerAffairs/Licenses/Dry Cleaning/Renewal"))
    {
        logDebug("app is Dry Cleaning");
        var dryCleanerExempt = checkForFee(parentCapId, "LIC_25")


        if (!dryCleanerExempt) 
        {
            logDebug("should not be exempt from fee");
            addFee("LIC_REN_01", "CA_LIC_REN", "FINAL", 1, "Y")
            logDebug("Added Renewal Fee") 
        }
    }
    if (appMatch("ConsumerAffairs/Licenses/Restricted Electrical/Renewal"))
    {
        addFee("LIC_09", "CA_LICENSE", "FINAL", 1, "Y") 
    }
    if (appMatch("ConsumerAffairs/Licenses/Restricted Plumbing/Renewal")) 
    {
        addFee("LIC_18", "CA_LICENSE", "FINAL", 1, "Y") 
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