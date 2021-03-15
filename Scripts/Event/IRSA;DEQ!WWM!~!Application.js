//IRSA/DEQ/WWM/*/Application 
//IRSA;DEQ!WWM!~!Application
showDebug=true;
logDebug("inspection ID: " + inspId);
var sewageDisposal = getAppSpecific("Method of Sewage Disposal");
logDebug("inspType: " + inspType + "  inspResult: " + inspResult);
logDebug("Sewage disposal: " + sewageDisposal);
var contactType = "Property Owner";
var iObjResult = aa.inspection.getInspection(capId,inspId);
var iObj = iObjResult.getOutput();
var inspTypeResult = aa.inspection.getInspectionType(iObj.getInspection().getInspectionGroup(), iObj.getInspectionType())
var inspTypeArr = inspTypeResult.getOutput();
var inspType = inspTypeArr[0]; // assume first
var inspSeq = inspType.getSequenceNumber();
logDebug("Inspection Sequence number: " + inspSeq);
if(sewageDisposal == "I/A System")
{
    logDebug("It is an I/A System. We are checking inspection type.");
    if(inspType == "I/A" && inspResult == "Complete")
    {
        var emailAddress = "";

        var params = aa.util.newHashtable();
        getRecordParams4Notification(params);
        addParameter(params,"$$inspection$$", inspSeq);
       var contactArray = getContactArray(capId);
        for (iCon in contactArray) {
            if(contactArray[iCon].contactType=="Property Owner")
            {
                emailAddress = contactArray[iCon].email;
                logDebug("Found email from " + contactArray[iCon].contactType + ": " + emailAddress);
            }
           
            }
        sendNotification("", emailAddress,"","IA_NOTIFICATION_FOR_PROPERTY_OWNER",params,null);
        logDebug("E-mail sent successfully!")
    }

    //push.
}