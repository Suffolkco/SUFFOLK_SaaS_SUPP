// Enter your script here...
//showDebug = true;
//default upload the status of Doc to System Generated for all docs in category DEQ_SIP_GRANTREPORTS
//EHIMS2-255
try{
		 var documentModelArray = aa.env.getValue("DocumentModelList");
				var docModel = documentModelArray.toArray();
				for (i in docModel) 
				  {
						if(docModel[i].getDocGroup()=="DEQ_SIP_GRANTREPORTS")
						{
									docModel[i].setDocStatus("System Generated");
									aa.document.updateDocument(docModel[i]);
						}
				  }





//need to get this so that it doesn't set this status on submittal, but does each time after that
if (publicUser)
{

var capmodel = aa.cap.getCap(capId).getOutput().getCapModel();
    if (capmodel.isCompleteCap())
    {

 var wfHist = aa.workflow.getWorkflowHistory(capId, null);
            var wfHistArray = [];
            if (wfHist.getSuccess())
            {
                wfHist = wfHist.getOutput();
                for (var h in wfHist)
                {
                    logDebug("wfhist[h] taskdesc is: " + wfHist[h].getTaskDescription());

                    wfHistArray.push(wfHist[h].getTaskDescription());
                }
                logDebug("wfhist array length is " + wfHistArray.length);
            } else
            {
                logDebug("not success");
            }

            if (wfHistArray.length != 0)
            {
              
		var appStatus = getAppStatus(capId);


		var documentModelArray = aa.env.getValue("DocumentModelList");
				var docModel = documentModelArray.toArray();
				for (i in docModel) 
		   {
					var docName = docModel[i].getDocCategory();
					if(docName != "Vendor Proposal")
					{
						updateAppStatus("Resubmitted");
					
					}
if(docName == "Vendor Proposal")
					{
						   if (isTaskActive("Pre-Install Review"))
						{
							updateTask("Pre-Install Review", "Resubmitted", "Additional information submitted by Applicant", "Additional information submitted by Applicant");
						}
					}

			}
     }
}
				  
  }
}

catch (ex)
  {
		logDebug("**ERROR** runtime error " + ex.message);
		
  }