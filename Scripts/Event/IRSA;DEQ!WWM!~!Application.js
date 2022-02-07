//IRSA/DEQ/WWM/*/Application 
//IRSA;DEQ!WWM!~!Application

showDebug = true;
logDebug("inspection ID: " + inspId);
var sewageDisposal = getAppSpecific("Method of Sewage Disposal");
var emailText = "";
logDebug("Sewage disposal: " + sewageDisposal);
var contactType = "Property Owner";

var iObjResult = aa.inspection.getInspection(capId, inspId);
var iObj = iObjResult.getOutput();
var inspTypeResult = aa.inspection.getInspectionType(iObj.getInspection().getInspectionGroup(), iObj.getInspectionType())
var inspTypeArr = inspTypeResult.getOutput();
var inspType = inspTypeArr[0]; // assume first
var inspSeq = inspType.getSequenceNumber();
logDebug("Inspection Sequence number: " + inspSeq);
logDebug("inspType: " + iObj.getInspectionType() + "  inspResult: " + inspResult);
var inspModel = iObj.getInspection();
var inspectionType = iObj.getInspectionType();


if (sewageDisposal == "I/A System")
{
    logDebug("It is an I/A System. We are checking inspection type.");
    if (inspectionType == "I/A" && inspResult == "Complete")
    {
        var emailAddress = "";

        var params = aa.util.newHashtable();
        getRecordParams4Notification(params);
        addParameter(params, "$$inspection$$", inspSeq);
        var contactArray = getContactArray(capId);
        for (iCon in contactArray)
        {
            if (contactArray[iCon].contactType == "Property Owner")
            {
                emailAddress = contactArray[iCon].email;
                logDebug("Found email from " + contactArray[iCon].contactType + ": " + emailAddress);
            }

        }
        sendNotification("", emailAddress, "", "IA_NOTIFICATION_FOR_PROPERTY_OWNER", params, null);
        logDebug("E-mail sent successfully!")
    }

    //push.
}

//removing WWWM checklist and copying in a new one JG 2.7
if (inspType == "WWM_RES_System 1")
{
    logDebug("current insp ID is: " + inspId);
    var inspModel = aa.inspection.getInspection(capId, inspId);
    logDebug("inspModel is: " + inspModel);
    //getting guidesheets from inspection being scheduled
    var gs = inspModel.getGuideSheets();
    if (!gs.isEmpty())
    {
        //looping through those guidesheets and removing any that exist before inspection is done being scheduled
        for (var gLoop = 0; gLoop < gs.size(); gLoop++)
        {
            var guideSheetObj = gs.get(gLoop);
            var guideSeq = guideSheetObj.getGuidesheetSeqNbr();
            logDebug("Hitting guidesheet number:" + guideSeq);
            var guideBiz = aa.proxyInvoker.newInstance("com.accela.aa.inspection.guidesheet.GGuideSheetBusiness").getOutput();
            guideBiz.removeGGuideSheet("SUFFOLKCO", guideSeq, "ADMIN");
            continue;
        }
    }
    else
    {
        logDebug("no guidesheets here, somehow...");
    }

    //defining our empty item list
    var itemList = aa.util.newArrayList();
    //getting inspection on the current record
    var inspectionResult = aa.inspection.getInspections(capId);
    if (inspectionResult.getSuccess())
    {
        //putting those inspections into an array
        var insArray = inspectionResult.getOutput();
        //targeting the most recent previous inspection (not the one currently being scheduled)
        var prevInsp = insArray[insArray.length - 1].getInspection();
        //pulling previous inspection's guidesheets
        var prevGs = prevInsp.getGuideSheets();

        if (prevGs != null)
        {
            //passing those guidesheets to an array
            var prevGsArray = prevGs.toArray();
            //adding each item from the array into itemList
            for (gs in prevGsArray)
            {
                itemList.add(prevGsArray[gs]);
            }
            //copy in the stuff from itemList into the new inspection
            var copyItems = aa.guidesheet.copyGGuideSheetItems(itemList, capId, inspId, currentUserID);
            if (copyItems.getSuccess())
            {
                logDebug("Copied guidesheet successfully.");
            }
        }
    }
    else
    {
        logDebug("**ERROR: Failed to copy: " + res.getErrorMessage());
    }
}

function getDocumentList()
{
    // Returns an array of documentmodels if any
    // returns an empty array if no documents

    var docListArray = new Array();

    docListResult = aa.document.getCapDocumentList(capId, currentUserID);

    if (docListResult.getSuccess())
    {
        docListArray = docListResult.getOutput();
    }
    return docListArray;
}

function debugObject(object)
{
    var output = '';
    for (property in object)
    {
        output += "<font color=red>" + property + "</font>" + ': ' + "<bold>" + object[property] + "</bold>" + '; ' + "<BR>";
    }
    logDebug(output);
}
function logDebug(dstr)
{
    if (showDebug)
    {
        aa.print(dstr)
        emailText += dstr + "<br>";
        aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr)
    }
}


