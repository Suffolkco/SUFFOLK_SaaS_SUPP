//DEQ_ENF_GENERATE_NOPH_REPORTS

var capId = aa.env.getValue("CapId");
var reportToSend = aa.env.getValue("reportToSend");
var reportParams = aa.util.newHashMap();

function getScriptText(vScriptName, servProvCode, useProductScripts) {
    if (!servProvCode)
        servProvCode = aa.getServiceProviderCode();
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    try
    {
        if (useProductScripts)
        {
            var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
        } else
        {
            var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
        }
        return emseScript.getScriptText() + "";
    } catch (err)
    {
        return "";
    }
}
var SCRIPT_VERSION = 3.0;
aa.env.setValue("CurrentUserID", "ADMIN");
eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, true));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS", null, true));
eval(getScriptText("INCLUDES_CUSTOM", null, true));

reportParams.put("RecordID", capId.getCustomID());

generateReportBatch(capId, reportToSend, 'DEQ', reportParams);


function generateReportBatch(itemCap, reportName, module, parameters) {
    //returns the report file which can be attached to an email.
    var user = currentUserID; // Setting the User Name
    var report = aa.reportManager.getReportInfoModelByName(reportName);
    logDebug("This is the Report Parameter " + parameters);
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
    aa.print("This is the permission on the report" + permit);
    logDebug("This is the permission on the report" + permit);
    if (permit.getOutput().booleanValue())
    {
        var reportResult = aa.reportManager.getReportResult(report);
        logDebug("Report Result" + reportResult.getSuccess());
        if (reportResult.getSuccess())
        {
            reportOutput = reportResult.getOutput();
            logDebug("This is the Report Output in the next part" + reportOutput);
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