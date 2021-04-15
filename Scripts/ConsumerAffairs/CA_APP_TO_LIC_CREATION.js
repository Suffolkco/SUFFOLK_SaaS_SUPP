//Purpose: Create License and link to Application as Parent, update Expiration date to "Expiration Date" field from application
//Author: RLittlefield
if (wfTask == "Issuance" && wfStatus == "Issued")
{
    //Creating License
    var result = aa.cap.createApp(appTypeArray[0], appTypeArray[1], appTypeArray[2], "NA", '');

    //if the final parameter above causes an error, enter either the alias of the record or a comment
    if (result.getSuccess())
    {
        var parentOut = result.getOutput();
        var parentId = aa.cap.getCapID(parentOut.getID1(), parentOut.getID2(), parentOut.getID3()).getOutput();
        var linkResult = aa.cap.createAppHierarchy(parentId, capId);
        if (linkResult.getSuccess())
        {
            var issueDateASI = getAppSpecific("Issued Date", capId);
            logDebug("Successfully linked to Application : " + capIDString);
            //Copying relevant info from Application to License
            copyContacts(capId, parentId);
            copyASIFields(capId, parentId);
            copyASITables(capId, parentId);
            copyDocuments(capId, parentId);
            aa.cap.updateAccessByACA(capId, "N");
            //Updating Expiration Date of License
            logDebug("ASI Expdate is: " + issueDateASI);
            issueDateASI = new Date(issueDateASI);
            logDebug("New Date Exp Date is: " + issueDateASI)
            var newExpDate = (issueDateASI.getMonth() + 1) + "/" + 1 + "/" + (issueDateASI.getFullYear() + 2);
            logDebug("New Exp Date is: " + newExpDate);
            editAppSpecific("Expiration Date", newExpDate, parentId);
            if (issueDateASI != null)
            {
                var b1ExpResult = aa.expiration.getLicensesByCapID(parentId);
                if (b1ExpResult.getSuccess())
                {
                    var b1Exp = b1ExpResult.getOutput();
                    b1Exp.setExpStatus("Active");
                    b1Exp.setExpDate(aa.date.parseDate(newExpDate));
                    aa.expiration.editB1Expiration(b1Exp.getB1Expiration()); 
                }
            }
            //Giving user Access to License in ACA
            var capResult = aa.cap.getCap(parentId).getOutput();
            var capModelResult = capResult.getCapModel();
            var pUser = capModelResult.getCreatedBy();
            var publicUserModelResult = aa.publicUser.getPublicUserByPUser(pUser);
            if (!publicUserModelResult.getSuccess() || !publicUserModelResult.getOutput()) 
            {
                logDebug("**WARNING** couldn't find public user " + publicUser + " " + publicUserModelResult.getErrorMessage());
            }
            else
            {
                var userSeqNum = publicUserModelResult.getOutput().getUserSeqNum();
                var attachResult = aa.cap.updateCreatedAccessBy4ACA(parentId, 'PUBLICUSER' + userSeqNum, 'Y', 'Y');
            }
            deactivateTaskByCap("Application", parentId);
            deactivateTaskByCap("Review", parentId);
            deactivateTaskByCap("Test", parentId);
            updateTask("Issuance", "Issued", "", "", "", parentId);
            activateTask("Issuance", "", parentId);
            updateAppStatus("Active", "", parentId);

        }
        else
        {
            logDebug("**ERROR: linking to application to (" + capIDString + "): " + linkResult.getErrorMessage());
        }
    }
}