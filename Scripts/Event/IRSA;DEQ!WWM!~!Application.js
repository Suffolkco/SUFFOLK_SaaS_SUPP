//IRSA/DEQ/WWM/*/Application 
//IRSA;DEQ!WWM!~!Application
showDebug=true;
logDebug("inspection ID: " + inspId);
var sewageDisposal = getAppSpecific("Method of Sewage Disposal");
var emailText ="";
logDebug("Sewage disposal: " + sewageDisposal);
var contactType = "Property Owner";

var iObjResult = aa.inspection.getInspection(capId,inspId);
var iObj = iObjResult.getOutput();
var inspTypeResult = aa.inspection.getInspectionType(iObj.getInspection().getInspectionGroup(), iObj.getInspectionType())
var inspTypeArr = inspTypeResult.getOutput();
var inspType = inspTypeArr[0]; // assume first
var inspSeq = inspType.getSequenceNumber();
logDebug("Inspection Sequence number: " + inspSeq);
logDebug("inspType: " + iObj.getInspectionType() + "  inspResult: " + inspResult);
var inspModel = iObj.getInspection();
var inspectionType = iObj.getInspectionType();


if(sewageDisposal == "I/A System")
{
    logDebug("It is an I/A System. We are checking inspection type.");
    if(inspectionType == "I/A" && inspResult == "Complete")
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

// EHIMS 4652
var itemCapType = aa.cap.getCap(capId).getOutput().getCapType().toString();
logDebug("itemCapType: " + itemCapType);

// If record type is WWM and it's a backoffice user, we do not want to update the status
if (itemCapType == "DEQ/WWM/Residence/Application" ||         
    itemCapType == "DEQ/WWM/Commercial/Application")
{
    if(inspectionType == "WWM_RES_System 1" && inspResult == "Incomplete")
    {    
        logDebug("inspType: " + inspectionType + "inspResult: " + inspResult);    
        if (inspModel != null) 
        {
        
            iResult = aa.inspection.copyInspectionWithGuideSheet(capId, capId, inspModel);
    
            if (iResult.getSuccess())
            {                     
                logDebug("Copy successfully.");

                var newResultObj = iResult.getOutput();
                             
                for (o in newResultObj)
                {
                    debugObject ("newResultObj:" + o);
                }

                        
                //logDebug("Sequence Number: " + iResult.getInspection().getSequenceNumber());
            
            }
        }
    }
        // Find inspSeqNum
    /*
        var inspResultObj = aa.inspection.getInspection(capId, inspSeqNum);
        if (inspResultObj.getSuccess()) {
            var inspObj = inspResultObj.getOutput();
            if (inspObj) {
                inspModel = inspObj.getInspection();
                if (inspModel != null) {
                    actModel = inspModel.getActivity();
                    actModel.setStatus("Scheduled");
                    //actModel.setStatusDate(new Date(sysDateMMDDYYYY));
                
                
                }
            }
        } */
        /*
        if(inspType == "WWM_RES_System 1" && inspResult == "Marginal")
        {
            inspector = inspList[xx].getInspector();
            inspDate = inspList[xx].getScheduledDate();
            inspTime = inspList[xx].getScheduledTime();
            inspType = inspList[xx].getInspectionType();
            inspComment = inspList[xx].getInspectionComments();

        */
        aa.sendMail("noreplyehims@suffolkcountyny.gov", "ada.chan@suffolkcountyny.gov", "", "IRSA - WWM", emailText);

    
}
function debugObject(object) {
    var output = '';
    for (property in object) {
        output += "<font color=red>" + property + "</font>" + ': ' + "<bold>" + object[property] + "</bold>" + '; ' + "<BR>";
    }
    logDebug(output);
}
function logDebug(dstr) {
	if(showDebug) {
		aa.print(dstr)
		emailText += dstr + "<br>";
		aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"),dstr)
	}
}


