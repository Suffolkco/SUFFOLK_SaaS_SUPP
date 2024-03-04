var emailText = "";

//DUA:DEQ/WR/Residence/Application
if (publicUser)
{ 
   var appStatus = getAppStatus(capId);

   // EHIMS-5036  
   var body = "appStatus: " + appStatus + " capId: " + capId + " Complete cap? " + cap.isCompleteCap();

   aa.sendMail("noreplyehims@suffolkcountyny.gov","ada.chan@suffolkcountyny.gov", "", "DUA WWM Resid App", body);

    // EHIMS-5115
    if (appStatus == "Pending" && !isTaskActive("Application Review"))
    {
         // Do not update
    }   
    // EHIMS-5036, 5115
   else if (!matches(appStatus, null, undefined, "", "null", "Review In Process", "Resubmitted" , "Received"))
   {       
      updateAppStatus("Resubmitted");        
   }

   // EHIMS-4902
   var docCat = 'Renewal/Update Form';
   var docCheck = false;

   for (var d = 0; d < documentModelArray.size(); d++) {
      var docGrp = documentModelArray.get(d).getDocGroup();
      var attachDocCat = documentModelArray.get(d).getDocCategory();
      logDebugLocal("docGrp " + docGrp); 
      logDebugLocal("attachDocCat " + attachDocCat); 
      if (attachDocCat == docCat)
      {
         docCheck = true;
         logDebugLocal("Found " + docCat); 
      }
   }
     
   if(docCheck)
   {
      logDebugLocal("Found Renewal/update doc attached."); 

      var feeEx = getAppSpecific("Fee Exempt");
      logDebugLocal("feeEx is: " + feeEx);

      if (feeEx == "No" || feeEx == null)
      {
         logDebugLocal("!feeExists is: " + !feeExists("RES-UP"));

         if (!feeExists("RES-UP"))
         {
            var taskFound = false;
            var pastSixYears = false;
            var todaysDate = new Date();																
            var todDateCon = (todaysDate.getMonth() + 1) + "/" + todaysDate.getDate() + "/" + (todaysDate.getFullYear());	            
            var wfHist = aa.workflow.getWorkflowHistory(capId, null);
            var wfDates = [];
            var minWfDate;

            if (wfHist.getSuccess())
            {
               wfHist = wfHist.getOutput();
            } 
            else
            {
               wfHist = new Array();
            }

            for (var h in wfHist)
            {
               logDebugLocal("wfHist[h].getTaskDescription(): " + wfHist[h].getTaskDescription());
               logDebugLocal("wfHist[h].getDisposition(): " + wfHist[h].getDisposition());

               if (wfHist[h].getTaskDescription() == "Plans Coordination" && wfHist[h].getDisposition() == "Approved")
               {
                  taskFound = true;                    
                  logDebugLocal("epoch milliseconds of status date is: " + wfHist[h].getDispositionDate().getEpochMilliseconds());    
                  wfDates.push(wfHist[h].getDispositionDate().getEpochMilliseconds());
                  minWfDate = Math.min.apply(null, wfDates);
                  logDebugLocal("Min wf Date is: " + minWfDate);
               }
            }

            if (taskFound)
            {
               var startDate = new Date();
               var todayDateCon = (startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + (startDate.getFullYear());
               
               logDebugLocal("Date to check: " + todayDateCon);

               
            
               minDate = new Date(minWfDate);        
               minDateCon = (minDate.getMonth() + 1) + "/" + minDate.getDate() + "/" + (minDate.getFullYear());
               logDebugLocal("The oldest workflow date is: " + minDateCon);
               var dateDiff = parseFloat(dateDifference(todayDateCon, minDate));

               logDebugLocal("Day difference is: " + dateDiff);
                           
               if (dateDiff < -2190) // The expiration date passed exactly 180 days 
               {
                  pastSixYears = true;
                  logDebugLocal("The original approval to construct was issued greater than 6 years ago.");
               }

               // Only if it has past six years, we add fee.
               if (!pastSixYears)
               {
                  addFee("RES-UP", "DEQ_SFR", "FINAL", 1, "Y");
                  logDebugLocal("Added RES-UP fee");
               }
               else
               {
                  logDebugLocal("No fee is added. The original approval to construct was issued greater than 6 years ago.");
               }
            }
            else
            {
               logDebugLocal("No task that is Plans Coordination and approved has been found. Skip adding fee.");
            }
         }
         else
         {
            logDebugLocal("RES-UP fee already exists. Not adding");
         }
      }
   }
   else
   {
      logDebugLocal("Did not find matching: " + docCat);
      logDebugLocal(documentModelArray);
   }
   aa.sendMail("noreplyehims@suffolkcountyny.gov","ada.chan@suffolkcountyny.gov", "", "DUA WWM RES", emailText);
}

function getAppStatus() {
	var itemCap = capId;
	if (arguments.length == 1) itemCap = arguments[0]; // use cap ID specified in args

	var appStatus = null;
   var capResult = aa.cap.getCap(itemCap);
   if (capResult.getSuccess()) {
      licCap = capResult.getOutput();
      if (licCap != null) {
         appStatus = "" + licCap.getCapStatus();
      }
   } else {
		logDebug("ERROR: Failed to get app status: " + capResult.getErrorMessage());
	}
	return appStatus;
}

function dateDifference(date1, date2)
{
    return (convertDate(date2).getTime() - convertDate(date1).getTime()) / (1000 * 60 * 60 * 24);
}


function logDebugLocal(dstr)
{
    if (showDebug)
    {
        aa.print(dstr)
        emailText += dstr + "<br>";
        aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr)
       
    }
}
