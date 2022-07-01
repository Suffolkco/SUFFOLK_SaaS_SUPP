//ASA:DEQ/GENERAL/COMPLAINT/NA
if (!publicUser)
{
    var conArray = getContactArray();
    var emailParams = aa.util.newHashtable();
    var complainantList = "";

    for (con in conArray)
    {
        if (matches(conArray[con]["contactType"], "Complainant"))
        {
            if (!matches(conArray[con].email, null, undefined, ""))
            {
                logDebug("Contact email: " + conArray[con].email);
                complainantList += conArray[con].email + "; ";
            }
        }
    }
    sendNotification("", complainantList, "", "DEQ_CMPLNT_SUBMITTED", emailParams, null);

    var suffcoOffice;
    //determining which entry to look up in the standard choice
    var deptToSend = AInfo["Offices"];

    if (deptToSend == "None")
    {
        suffcoOffice = "None";
    }
    else if (deptToSend == "Office of Ecology")
    {
        suffcoOffice = "Office of Ecology";
    }
    else if (deptToSend == "Office of Pollution Control")
    {
        suffcoOffice = "Office of Pollution Control";
    }
    else if (deptToSend == "Office of Wastewater Management")
    {
        suffcoOffice = "Office of Wastewater Management";
    }
    else if (deptToSend == "Office of Water Resources")
    {
        suffcoOffice = "Office of Water Resources";
    }

    var staffEmailsToSend = lookup("DEQ_CMPLNT_OFFICE_EMAILS", suffcoOffice);


    sendNotification("", staffEmailsToSend, "", "DEQ_CMPLNT_ASSIGNED", emailParams, null);

}