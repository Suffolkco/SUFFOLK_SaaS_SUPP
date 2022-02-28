showDebug = true;


if (wfTask == "Tracking" && wfStatus == "System Valid")
{
    var workflowResult = aa.workflow.getTasks(capId);

    if (workflowResult.getSuccess())
    {
        wfObj = workflowResult.getOutput();
    }

    for (i in wfObj)
    {
        fTask = wfObj[i];
        logDebug("Task Description: " + fTask.getTaskDescription());
        logDebug("Task Disposition: " + fTask.getDisposition());        

        if (fTask.getTaskDescription().equals("Tracking") && fTask.getDisposition().equals("System Valid"))
        {      
            logDebug("Status Date: " +  fTask.getStatusDate());          
           
            if (fTask.getStatusDate() != null)
            {
                var expDateMMDDYYY = (fTask.getStatusDate().getMonth() + 1) + "/" + fTask.getStatusDate().getDate() + "/" + (parseInt(fTask.getStatusDate().getYear() + 3) + 1900);
                
                logDebug("ftTask expDateMMDDYYY: " + expDateMMDDYYY);
                expDateMMDDYYY = aa.date.parseDate(expDateMMDDYYY); 
                
                var b1ExpResult = aa.expiration.getLicensesByCapID(capId);
                b1Exp = b1ExpResult.getOutput();
                b1Exp.setExpDate(expDateMMDDYYY);
                
                b1Exp.setExpStatus("Pending");
                aa.expiration.editB1Expiration(b1Exp.getB1Expiration());  
            }
            
        }            
                    
    }
}

if (wfTask == "Registration Submitted" && wfStatus == "System Valid")
{
//Start Notification to Parent Contacts/LPs
logDebug("capId = " + capId);
var AInfo = new Array();
logDebug("parentCapId = " + parentCapId);                     
var conEmail = "";
var wwmIA = capId.getCustomID();
logDebug("wwmIA =" + wwmIA);
var pin = AInfo["IA PIN Number"];
logDebug("pin = " + pin);
                            
//gathering LPs from parent
var licProfResult = aa.licenseScript.getLicenseProf(parentCapId);
var capLPs = licProfResult.getOutput();
for (l in capLPs)
{
    if (!matches(capLPs[l].email, null, undefined, ""))
    {
        conEmail += capLPs[l].email + ";"
    }
}

//gathering contacts from parent
var contactResult = aa.people.getCapContactByCapID(parentCapId);
var capContacts = contactResult.getOutput();
for (c in capContacts)
{
    if (!matches(capContacts[c].email, null, undefined, ""))
    {
        conEmail += capContacts[c].email + ";"
    }
}

//Sending Notification

var vEParams = aa.util.newHashtable();
var addrResult = getAddressInALine(capId);
addParameter(vEParams, "$$altID$$", wwmIA);
addParameter(vEParams, "$$address$$", addrResult);
addParameter (vEParams, "$$pin$$", pin);

sendNotification("", conEmail, "", "DEQ_IA_APPLICATION_NOTIFICATION", vEParams, null);
}

function getAddressInALine(capId)
{

    var capAddrResult = aa.address.getAddressByCapId(capId);
    var addressToUse = null;
    var strAddress = "";

    if (capAddrResult.getSuccess())
    {
        var addresses = capAddrResult.getOutput();
        if (addresses)
        {
            for (zz in addresses)
            {
                capAddress = addresses[zz];
                if (capAddress.getPrimaryFlag() && capAddress.getPrimaryFlag().equals("Y"))
                    addressToUse = capAddress;
            }
            if (addressToUse == null)
                addressToUse = addresses[0];

            if (addressToUse)
            {
                strAddress = addressToUse.getHouseNumberStart();
                var addPart = addressToUse.getStreetDirection();
                if (addPart && addPart != "")
                    strAddress += " " + addPart;
                var addPart = addressToUse.getStreetName();
                if (addPart && addPart != "")
                    strAddress += " " + addPart;
                var addPart = addressToUse.getStreetSuffix();
                if (addPart && addPart != "")
                    strAddress += " " + addPart;
                var addPart = addressToUse.getCity();
                if (addPart && addPart != "")
                    strAddress += " " + addPart + ",";
                var addPart = addressToUse.getState();
                if (addPart && addPart != "")
                    strAddress += " " + addPart;
                var addPart = addressToUse.getZip();
                if (addPart && addPart != "")
                    strAddress += " " + addPart;
                return strAddress
            }
        }
    }
    return null;
}