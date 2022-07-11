//WTUA:DEQ/GENERAL/COMPLAINT/NA
var emailParams = aa.util.newHashtable();
var templateName = "";
addParameter(emailParams, "$$altID$$", capId.getCustomID());


if (matches(wfTask, "Complaint Received"))
{
  if (matches(wfStatus, "Assign to OPC", "Assign to WR", "Assign to WWM", "Assign to Ecology", "Assign to STP"))
  {
    var userSendFrom = aa.person.getUser(currentUserID).getOutput();
    var userFromDept = getDepartmentName(currentUserID);
    var userNameFrom = userSendFrom.getFirstName() + " " + userSendFrom.getLastName();
    var userIdAssigned = getUserIDAssignedToTask(capId, wfTask);
    var userToSend = aa.person.getUser(userIdAssigned).getOutput();
    addParameter(emailParams, "$$userId$$", userNameFrom);
    addParameter(emailParams, "$$userDept$$", userFromDept);
    logDebug("sending email to " + userToSend.getEmail());
    if (wfStatus == "Assign to Ecology")
    {
        suffcoOffice = "Office of Ecology";
    }
    else if (wfStatus == "Assign to OPC")
    {
        suffcoOffice = "Office of Pollution Control";
    }
    else if (wfStatus == "Assign to WWM")
    {
        suffcoOffice = "Office of Wastewater Management";
    }
    else if (wfStatus == "Assign to WR")
    {
        suffcoOffice = "Office of Water Resources";
    }
    else if (wfStatus == "Assign to STP")
    {
        suffcoOffice = "Sewage Treatment Plants";
    }

    var staffEmailsToSend = lookup("DEQ_CMPLNT_OFFICE_EMAILS", suffcoOffice);

    sendNotification("", staffEmailsToSend, "", "DEQ_CMPLNT_REASSIGNED", emailParams, null);
  }
}

if (matches(wfTask, "Investigation Review"))
{
  if (wfStatus == "Reassign")
  {
    var userSendFrom = aa.person.getUser(currentUserID).getOutput();
    var userFromDept = getDepartmentName(currentUserID);
    var userNameFrom = userSendFrom.getFirstName() + " " + userSendFrom.getLastName();
    var userIdAssigned = getUserIDAssignedToTask(capId, wfTask);
    var userToSend = aa.person.getUser(userIdAssigned).getOutput();
    addParameter(emailParams, "$$userId$$", userNameFrom);
    addParameter(emailParams, "$$userDept$$", userFromDept);
    logDebug("sending email to " + userToSend.getEmail());
    sendNotification("", userToSend.getEmail(), "", "DEQ_CMPLNT_REASSIGNED", emailParams, null);
  }
}



if (wfTask == "Investigation Review" && wfStatus == "Referred to Other Office")
{
  var userId = getUserIDAssignedToTask(capId, wfTask)
  activateTask("Complaint Received");
  assignTask("Complaint Received", userId);
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