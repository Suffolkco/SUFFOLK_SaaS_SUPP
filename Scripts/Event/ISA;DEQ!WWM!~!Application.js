//ISA;DEQ!WWM!~!Application
//showDebug = true;
var emailText = "";
logDebugLocal("Information: " + inspId + "," + inspSchedDate);
// Not used anymore
/*
inspId 566190   // is the new inspection
inspInspector =
InspectorFirstName = null
InspectorMiddleName = null
InspectorLastName = null
inspGroup = WWM_INSP
inspType = WWM_RES_System 1
inspSchedDate = 1/18/2022 */

// EHIMS-4709: Copy the inspection scheduled date to record scheduled date field.
// *********************************************************************************
appTypeResult = cap.getCapType();
appTypeString = appTypeResult.toString();
appTypeArray = appTypeString.split("/");
if (appTypeArray[0] == "DEQ" && appTypeArray[1] == "WWM" && appTypeArray[2] == "Residence" && appTypeArray[3] == "Application") 
{
    logDebugLocal("Set inspeciation date: " + inspSchedDate + "," + inspType);

    var iObjResult = aa.inspection.getInspection(capId, inspId);
    var iObj = iObjResult.getOutput();
    var inspectionType = iObj.getInspectionType();

    logDebugLocal("Inspection scheduled Con date: " + inspSchedDate);
    logDebugLocal("Inspection inspector name: " + InspectorFirstName + " " + InspectorMiddleName + " " + InspectorLastName);
    var cdScriptObjResult = aa.cap.getCapDetail(capId);
    if (!cdScriptObjResult.getSuccess())
    {logDebugLocal("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage());}

    var cdScriptObj = cdScriptObjResult.getOutput();

    if (!cdScriptObj)
    {logDebugLocal("**ERROR: No cap detail script object");}

    cd = cdScriptObj.getCapDetailModel();

    //var todaysDate = new Date();
    //var dateCon = (todaysDate.getMonth() + 1) + "/" + todaysDate.getDate() + "/" + todaysDate.getFullYear();
    //logDebugLocal("dateCon: " + dateCon);
    var dateAdd = addDays(inspSchedDate, 0);
    logDebugLocal("DateAdd Date: " + dateAdd);
    var dateMMDDYYY = jsDateToMMDDYYYY(dateAdd);
    logDebugLocal("JS DATE to dateMMDDYYY: " + dateMMDDYYY);
    logDebugLocal("Current Record Scheduled Date: " + cd.getScheduledDate());
    logDebugLocal("Current Record Inspection Name is: " + cd.getInspectorName());

    dateMMDDYYY = aa.date.parseDate(dateMMDDYYY);
    logDebugLocal("Parse date: " + dateMMDDYYY);
    try
    {
        logDebugLocal("Set Scehdule Date.");
        cdScriptObj.setScheduledDate(dateMMDDYYY);
        var inspectorObj = null;
        if (InspectorFirstName != null && InspectorLastName != null)
        {
            inspUserObj = aa.person.getUser(InspectorFirstName, InspectorMiddleName, InspectorLastName);
            logDebugLocal("inspUserObj: " + inspUserObj);
            if (inspUserObj.getSuccess())
            {
                logDebugLocal("Set inspector");
                var inspectorObj = inspUserObj.getOutput();
                logDebugLocal("inspectorObj: " + inspectorObj);
                logDebugLocal("userID: " + inspectorObj.getUserID());
                //cdScriptObj.setInspectorName(firstName + LastName);
                cdScriptObj.setInspectorId(inspectorObj.getUserID());
            }
        }
    }
    catch (ex)
    {
        logDebugLocal("**ERROR** runtime error " + ex.message);
    }

    cdWrite = aa.cap.editCapDetail(cd)

    if (!cdWrite.getSuccess())
    {
        logDebugLocal("**ERROR writing capdetail: " + cdWrite.getErrorMessage());
    }
    else
    {
        logDebugLocal("Updated scheduled date to: " + dateMMDDYYY);
    }
}
// *********************************************************************************

var inspectionResult = aa.inspection.getInspections(capId);
if (inspectionResult.getSuccess())
{
    if (inspectionResult.getOutput().length >= 2)
    {
        var lastInsp;
        lastInsp = inspectionResult.getOutput()[inspectionResult.getOutput().length - 2];
        lastInsp = lastInsp.getIdNumber();
    }
}



logDebug("this is the script that is running");
if (lastInsp)
{
    copyAllGuidesheets(lastInsp, inspId, capId, true);
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}


function jsDateToMMDDYYYY(pJavaScriptDate) {
    //converts javascript date to string in MM/DD/YYYY format
    if (pJavaScriptDate != null)
    {
        if (Date.prototype.isPrototypeOf(pJavaScriptDate))
        {
            return (pJavaScriptDate.getMonth() + 1).toString() + "/" + pJavaScriptDate.getDate() + "/" + pJavaScriptDate.getFullYear();
        } else
        {
            logDebug("Parameter is not a javascript date");
            return ("INVALID JAVASCRIPT DATE");
        }
    } else
    {
        logDebug("Parameter is null");
        return ("NULL PARAMETER VALUE");
    }
}

function copyAllGuidesheets(inspId1, inspId2) {
    /*
    Will copy all guidesheets (1:1) from inspId1 to inspId2 on same record
    Not using aa.inspection.getInspection() because the .getGuideSheets() always returns null
    Author CGray
    @param inspId1 {Number} Inspection sequence number of source
    @param inspId2 {Number} Inspection sequence number of target
    Optional {object} Source record
    Optional {boolean} to remove all existing guidesheets from target
    */
    var itemCap = capId;
    var rExisting = false;
    if (arguments.length >= 3)
    {
        itemCap = arguments[2];
    }
    if (arguments.length >= 4)
    {
        rExisting = arguments[3];
    }
    var inspResult = aa.inspection.getInspections(itemCap);
    if (inspResult.getSuccess())
    {
        var itemList = aa.util.newArrayList();
        var inspArray = inspResult.getOutput();
        for (ins in inspArray)
        {
            if (inspArray[ins].getIdNumber() == inspId1)
            {
                var guides = inspArray[ins].getInspection().getGuideSheets();
                if (guides != null)
                {
                    var gArray = guides.toArray();
                    for (gs in gArray)
                    {
                        itemList.add(gArray[gs]);
                    }
                }
            }
            else if (inspArray[ins].getIdNumber() == inspId2)
            {
                if (rExisting)
                {
                    var guides = inspArray[ins].getInspection().getGuideSheets();
                    if (guides != null)
                    {
                        var gArray = guides.toArray();
                        for (gs in gArray)
                        {
                            aa.print("Removing guidesheet: " + gArray[gs].getGuideType());
                            var guideBiz = aa.proxyInvoker.newInstance("com.accela.aa.inspection.guidesheet.GGuideSheetBusiness").getOutput();
                            guideBiz.removeGGuideSheet("SUFFOLKCO", gArray[gs].getGuidesheetSeqNbr(), "ADMIN");
                        }
                    }
                }
            }
        }
        if (!itemList.isEmpty())
        {
            var copyItems = aa.guidesheet.copyGGuideSheetItems(itemList, itemCap, inspId2, currentUserID);
            if (copyItems.getSuccess())
            {
                aa.print("Copied guidesheet successfully.");
            }
        }
    }
}

function logDebugLocal(dstr) {
    if (showDebug)
    {
        aa.print(dstr)
        emailText += dstr + "<br>";
        aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr)
    }
}