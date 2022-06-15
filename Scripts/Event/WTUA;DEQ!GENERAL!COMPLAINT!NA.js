//WTUA:DEQ/GENERAL/COMPLAINT/NA
var emailParams = aa.util.newHashtable();
var templateName = "";

if (matches(wfTask, "Complaint Received", "Investigation Review"))
{
  if (wfStatus == "Reassign")
  {
    var userId = getUserIDAssignedToTask(capId, wfTask)
    var userToSend = aa.person.getUser(userId).getOutput();
    logDebug("sending email to " + userToSend.getEmail());
    sendNotification("", userToSend.getEmail(), "", templateName, emailParams, null);
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

function getUserIDAssignedToTask(vCapId, taskName) {
  currentUsrVar = null;
  var taskResult1 = aa.workflow.getTask(vCapId, taskName);
  if (taskResult1.getSuccess())
  {
    tTask = taskResult1.getOutput();
  } else
  {
    logMessage("**ERROR: Failed to get workflow task object ");
    return false;
  }
  taskItem = tTask.getTaskItem();
  taskUserObj = tTask.getTaskItem().getAssignedUser();
  taskUserObjLname = taskUserObj.getLastName();
  taskUserObjFname = taskUserObj.getFirstName();
  taskUserObjMname = taskUserObj.getMiddleName();
  currentUsrVar = aa.person.getUser(taskUserObjFname, taskUserObjMname, taskUserObjLname).getOutput();
  if (currentUsrVar != null)
  {
    currentUserIDVar = currentUsrVar.getGaUserID();
    return currentUserIDVar;
  } else
  {
    return false;
  }
}