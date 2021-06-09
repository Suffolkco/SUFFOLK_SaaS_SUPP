//PRA
//When Violation full balance is paid, update parent Complaint record with appropriate status

if (balanceDue == 0) 
{
    var vWF = aa.workflow.getTasks(capId);
    if (vWF.getSuccess()) 
    {
        vWF = vWF.getOutput();
    }
    else 
    {
        logDebug("Failed to get workflow tasks");
    }
    var x = 0;
    for (x in vWF) 
    {
        var vTask = vWF[x];
        var vTaskItem = vTask.getTaskItem();
        var vTaskName = "Payment";
        var vProcessID = vTask.getProcessID();
        var vProcessCode = vTask.getProcessCode();
        var vStepNum = vTask.getStepNumber();
        var vEParams = aa.util.newHashtable();
        var vRParams = aa.util.newHashtable();
        var conEmail = '';

        if (isTaskActive(vTaskName) == true) 
        {
            closeTask(vTaskName, "Paid", "Updated via PRA script", "Updated via PRA script");
            //need to know which status to use here
            if (parentCapId)
            {
                updateAppStatus(parentCapId, "In Review", "");
            }

            var conArray = getContactArray(capId);
            for (con in conArray)
            {
                if (!matches(conArray[con].email, null, undefined, ""))
                {
                    if (conArray[con].contactType == "Applicant") 
                    {
                        conEmail += conArray[con].email;
                    }
                }
            }

           /* var contactResult = aa.people.getCapContactByCapID(capId);
            if (contactResult.getSuccess())
            {
                var capContacts = contactResult.getOutput();
                for (c in capContacts)
                {
                    if (capContacts[c].getCapContactModel().getContactType() == "Applicant")
                    {
                        addParameter(vEParams, "$$FullNameBusName$$", getContactName(capContacts[c]));
                    }
                }
            }*/
        }
    }
}


