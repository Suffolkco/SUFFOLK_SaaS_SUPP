//IRSA:DEQ/~/~/~

var insYear = inspObj.getInspectionStatusDate().getYear().toString();
var insMonth = inspObj.getInspectionStatusDate().getMonth().toString();
var insDay = inspObj.getInspectionStatusDate().getDayOfMonth().toString();

if (insMonth.length == 1)
{
    insMonth = "0" + insMonth;
}
if (insDay.length == 1)
{
    insDay = "0" + insDay;
}

var insCon = insMonth + "/" + insDay + "/" + insYear;

if (inspType == "Sampling Event" && inspResult == "Sent to Lab")
{	
    insId = inspObj.getIdNumber();
    var rParams = aa.util.newHashMap();
	var rFile = new Array();
    rParams.put("INSP_SEQ_NO", insId.toString());
    rParams.put("BLANK", insCon);
    //logDebug("Params are: " + rParams);//
    // Old report
    //rFile = reportRunSave("Analysis_Request_Form_by_Insp_Seq_No", true, false, true, "General", rParams);
    // New report
    rFile = reportRunSave("603_Sample_Submission_Form_New", true, false, true, "General", rParams);
    
}