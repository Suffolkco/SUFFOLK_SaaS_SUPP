//WTUA:DEQ/GENERAL/COMPLAINT/NA
var emailParams = aa.util.newHashtable();

if (matches(wfTask, "Complaint Received", "Investigation Review"))
{
  if (wfStatus == "Reassign")
  {
    var assignedUser = wfTaskObj.getAssignedStaff();
    logDebug("assigned user is: " + assignedUser);
    if (!matches(wfTaskObj.getAssignedStaff(), null, ""))
    {
      var userSplit = String(wfTaskObj.getAssignedStaff());
      var assignUser = aa.people.getUsersByUserIdAndName(userSplit);
      if (assignUser.getSuccess())
      {
        logDebug("assigned user is: " + assignedUser);
        var userOut = assignUser.getOutput();
        if (userOut != null)
        {
          logDebug("user email is: " + userOut.getEmail());
          sendNotification("", userOut.getEmail(), "", templateName, emailParams, null);
        }
      }
    }
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