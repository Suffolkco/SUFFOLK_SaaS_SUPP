//IRSA:DEQ/OPC/HAZARDOUS TANK/PERMIT

showDebug = true;
var emailText = "";
var today = new Date();

var parentCap = getParent(capId);
logDebug("Identified: " + parentCap.getCustomID() + " as the parent.");

var tankNumber = getAppSpecific("SCDHS Tank #", capId);
logDebug("This is the tank we are looking for: " + tankNumber);
var inspectionUpdate = '';
var todaysDate = today.getMonth() + "/" + today.getDate() + "/" + today.getYear()
var inspectionUpdate = todaysDate + " " + inspType;
editASITableRowViaRowIdentifer(parentCap, "TANK INFORMATION", "Last Inspection", inspectionUpdate, tankNumber, "Tank #");


//EHIMS-4805
if (inspResult == "Completed" || inspResult == "Fail")
{
    if (inspType == "Non-PBS Tank OP Inspection" ||
        inspType == "Non-PBS Tank Other Inspection" ||
        inspType == "Non-PBS Tank Re-Inspection" ||
        inspType == "PBS Tank GSR Inspection" ||
        inspType == "PBS Tank OP Inspection" ||
        inspType == "PBS Tank Other Inspection" ||
        inspType == "PBS Tank Re-Inspection")
    {

        /*inspId 566672
        inspResult = Fail
        inspComment = null
        inspResultDate = 2/24/2022
        inspGroup = DEQ_TANKMON
        inspType = Non-PBS Tank OP Inspection
        inspSchedDate = 2/24/2022*/

        var emailParams = aa.util.newHashtable();
        var reportParams = aa.util.newHashtable();
        var reportFile = new Array();
        var alternateID = capId.getCustomID();

        //insps[i].getInspectionDate()
        inspModel = inspObj.getInspection();

        //reportParams.put("InspectionDate",  inspObj.getInspectionDate());
        //inspDate = inspObj.getInspectionDate();

        logDebug("inspResultDate: " + inspResultDate);
        logDebug("inspection object date: " + inspObj.getInspectionDate());
        logDebug("inspection object date: " + inspObj.getInspectionDate());
        logDebug("alternateID: " + alternateID.toString());
        logDebug("inspSchedDate: " + inspSchedDate);
        var year = inspObj.getInspectionDate().getYear();
        var month = inspObj.getInspectionDate().getMonth();
        var day = inspObj.getInspectionDate().getDayOfMonth();
        var hr = inspObj.getInspectionDate().getHourOfDay() - 1;
        var min = inspObj.getInspectionDate().getMinute();
        var sec = inspObj.getInspectionDate().getSecond();

        logDebug("Inspection DateTime: " + year + "-" + month + "-" + day + " " + hr + ':' + min + ":" + sec + ".0");
        var inspectionDateCon = year + "-" + month + "-" + day + " " + hr + ':' + min + ":" + sec + ".0";

        logDebug("capId: " + capId);
        logDebug("inspectionDateCon: " + inspectionDateCon);

        //var retVal = new Date(String(inspectionDateCon));
        //logDebug("retVal Date: " + retVal);
        addParameter(reportParams, "TankRecordID", alternateID.toString());
        //addParameter(reportParams, "InspectionId", inspObj.getIdNumber().toString());
        addParameter(reportParams, "InspectionDate", inspectionDateCon);
        addParameter(reportParams, "InspectionType", inspType);

        rFile = generateReportBatch(capId, "Inspection result Tank Operator", 'DEQ', reportParams);
        logDebug("This is the rFile: " + rFile);

        if (rFile)
        {
            var rFiles = new Array();
            rFiles.push(rFile);

            getRecordParams4Notification(emailParams);
            addParameter(emailParams, "$$altID$$", capId.getCustomID());
            sendNotification("", "Michael.Seaman@suffolkcountyny.gov", "", "DEQ_OPC_HAZARDOUS_TANK_INSPECTION", emailParams, rFiles);
        }
    }
}

if (matches(inspType, "Non-PBS Tank OP Inspection", "Non-PBS Tank Other Inspection", "Non-PBS Tank Re-Inspection", "PBS Tank GSR Inspection", "PBS Tank OP Inspection", "PBS Tank Other Inspection", "PBS Tank Re-Inspection"))
{
    if (inspResult == "Violations Found")
    {
        var childEnfRecordArray = getChildren("DEQ/OPC/Enforcement/NA", parentCap);
        logDebug("childenfrecordarray length is: " + childEnfRecordArray.length);
        if (childEnfRecordArray.length == 0)
        {
            var enfChild = createChild("DEQ", "OPC", "Enforcement", "NA", null, parentCap);
            copyContacts(capId, enfChild);
            copyParcel(capId, enfChild);
            copyAddress(capId, enfChild);
            var siteAltId = parentCap.getCustomID();
            editAppSpecific("Site/Pool (Parent) Record ID", siteAltId, enfChild);
            var fileRefNumber = getAppSpecific("File Reference Number", parentCap);
            editAppSpecific("File Reference Number/Facility ID", fileRefNumber, enfChild);
            var appName = getAppNameLocal(parentCap);
            var projDesc = workDescGet(parentCap);
            editAppName(appName, enfChild);
            updateWorkDesc(projDesc, enfChild);
            var alternateID = capId.getCustomID();
            var year = inspObj.getInspectionDate().getYear();
            var month = inspObj.getInspectionDate().getMonth();
            var day = inspObj.getInspectionDate().getDayOfMonth();
            var hr = inspObj.getInspectionDate().getHourOfDay() - 1;
            var min = inspObj.getInspectionDate().getMinute();
            var sec = inspObj.getInspectionDate().getSecond();

            logDebug("Inspection DateTime: " + year + "-" + month + "-" + day + " " + hr + ':' + min + ":" + sec + ".0");
            var inspectionDateCon = year + "-" + month + "-" + day + " " + hr + ':' + min + ":" + sec + ".0";

            logDebug("capId: " + capId);
            logDebug("inspectionDateCon: " + inspectionDateCon);
            var reportParams = aa.util.newHashtable();

            //var retVal = new Date(String(inspectionDateCon));
            //logDebug("retVal Date: " + retVal);
            addParameter(reportParams, "TankRecordID", alternateID.toString());
            //addParameter(reportParams, "InspectionId", inspObj.getIdNumber().toString());
            addParameter(reportParams, "InspectionDate", inspectionDateCon);
            addParameter(reportParams, "InspectionType", inspType);

            generateReportBatch(enfChild, "Inspection result Tank Operator Script", 'DEQ', reportParams);
        }
        else
        {
            var reportParams = aa.util.newHashtable();

            for (cr in childEnfRecordArray)
            {
                var childEnfRecord = childEnfRecordArray[cr];
                logDebug("child enf record is: " + childEnfRecord);
                var childRecCapType = aa.cap.getCap(childEnfRecordArray[cr]).getOutput().getCapType();
                logDebug("childreccaptype is: " + childRecCapType);
                if (childRecCapType == "DEQ/OPC/Enforcement/NA")
                {
                    //update violations ASITs only
                }
                var alternateID = capId.getCustomID();
                var year = inspObj.getInspectionDate().getYear();
                var month = inspObj.getInspectionDate().getMonth();
                var day = inspObj.getInspectionDate().getDayOfMonth();
                var hr = inspObj.getInspectionDate().getHourOfDay() - 1;
                var min = inspObj.getInspectionDate().getMinute();
                var sec = inspObj.getInspectionDate().getSecond();
                var inspectionDateCon = year + "-" + month + "-" + day + " " + hr + ':' + min + ":" + sec + ".0";
                addParameter(reportParams, "TankRecordID", alternateID.toString());
                //addParameter(reportParams, "InspectionId", inspObj.getIdNumber().toString());
                addParameter(reportParams, "InspectionDate", inspectionDateCon);
                addParameter(reportParams, "InspectionType", inspType);

                generateReportBatch(childEnfRecord, "Inspection result Tank Operator Script", 'DEQ', reportParams);

            }
        }
    }
}

function sendNotification(emailFrom, emailTo, emailCC, templateName, params, reportFile) {
    var itemCap = capId;
    if (arguments.length == 7) itemCap = arguments[6]; // use cap ID specified in args
    var id1 = itemCap.ID1;
    var id2 = itemCap.ID2;
    var id3 = itemCap.ID3;
    var capIDScriptModel = aa.cap.createCapIDScriptModel(id1, id2, id3);
    var result = null;
    result = aa.document.sendEmailAndSaveAsDocument(emailFrom, emailTo, emailCC, templateName, params, capIDScriptModel, reportFile);
    if (result.getSuccess())
    {
        logDebug("Sent email successfully!");
        return true;
    }
    else
    {
        logDebug("Failed to send mail. - " + result.getErrorType());
        return false;
    }
}

function debugObject(object) {
    var output = '';
    for (property in object)
    {
        output += "<font color=red>" + property + "</font>" + ': ' + "<bold>" + object[property] + "</bold>" + '; ' + "<BR>";
    }
    logDebug(output);
}
function generateReportBatch(itemCap, reportName, module, parameters) {
    //returns the report file which can be attached to an email.
    var user = currentUserID; // Setting the User Name
    logDebug("user: " + user);
    logDebug("Resport Name: " + reportName);
    var report = aa.reportManager.getReportInfoModelByName(reportName);
    if (!report.getSuccess() || report.getOutput() == null)
    {
        logDebug("**WARN report generation failed, missing report or incorrect name: " + reportName);
        return false;
    }
    report = report.getOutput();
    report.setModule(module);
    report.setCapId(itemCap); //CSG Updated from itemCap.getCustomID() to just itemCap so the file would save to Record
    report.setReportParameters(parameters);

    var permit = aa.reportManager.hasPermission(reportName, user);

    if (permit.getOutput().booleanValue())
    {
        var reportResult = aa.reportManager.getReportResult(report);
        if (reportResult.getSuccess())
        {
            reportOutput = reportResult.getOutput();
            var reportFile = aa.reportManager.storeReportToDisk(reportOutput);
            reportFile = reportFile.getOutput();
            return reportFile;
        } else
        {
            logDebug("**WARN System failed get report: " + reportResult.getErrorType() + ":" + reportResult.getErrorMessage());
            return false;
        }
    } else
    {
        logDebug("You have no permission.");
        return false;
    }
}

function getAppNameLocal(givenCap) {
    var itemCap = givenCap;
    if (arguments.length == 1) itemCap = arguments[0]; // use cap ID specified in args

    capResult = aa.cap.getCap(itemCap)

    if (!capResult.getSuccess())
    { logDebug("**WARNING: error getting cap : " + capResult.getErrorMessage()); return false }

    capModel = capResult.getOutput().getCapModel()

    return capModel.getSpecialText()
}


