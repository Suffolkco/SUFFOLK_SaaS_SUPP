//WTUA:DEQ/GENERAL/COMPLAINT/NA

if (matches(wfTask, "Complaint Received", "Investigation Review"))
{
    if (wfStatus == "Assign to Ecology")
    {
        //sendNotification("", emailAddress, "", templateName, emailParams, null);
    }
    if (wfStatus == "Assign to WWM")
    {
        //sendNotification("", emailAddress, "", templateName, emailParams, null);
    }
    if (wfStatus == "Assign to WR")
    {
      //  sendNotification("", emailAddress, "", templateName, emailParams, null);
    }
    if (wfStatus == "Assign to OPC")
    {
    //    sendNotification("", emailAddress, "", templateName, emailParams, null);
    }
    if (wfStatus == "Assign to STP")
    {
  //      sendNotification("", emailAddress, "", templateName, emailParams, null);
    }
}
if (wfTask == "Investigation Review" && wfStatus == "Referred to Other Office")
{
    var assignedUser = wfTaskObj.getAssignedStaff();
    activateTask("Complaint Received");
    assignTask("Complaint Received", assignedUser);
    updateTask("Complaint Received", "In Review", "", "");
//    sendNotification("", emailAddress, "", templateName, emailParams, null);
}