//ASIUA;CONSUMERAFFAIRS!LOCAL LAWS!~!~!

var itemCap = aa.cap.getCap(capId).getOutput();
var appTypeResult = itemCap.getCapType();
var appTypeString = appTypeResult.toString(); 
var appTypeArray = appTypeString.split("/");
var tag = "";

var contractId = getAppSpecific("Contract ID");
logDebug("contract id: " + contractId);  

// For new contract, we update the contract ID and altid and its child.
if (appTypeArray[3] == "New Contract")
{   
    if(!matches(contractId,null,undefined,""))
    {
        // Update current record to new custom ID 
        result = aa.cap.updateCapAltID(capId, contractID);
        if (result.getSuccess())
        logDebug("Successfully updated alt Id to: " + contractID);
        else
        logDebug("Problem updating alt Id: " + result.getErrorMessage());   
    
        var childArray = getChildren("ConsumerAffairs/Local Laws/*/*", capId);
        for (var c in childArray) 
        {
            var childId = childArray[c];
            if (appMatch("ConsumerAffairs/Local Laws/Lawful Hiring/NA",childId))
            {
                tag = "-LH";
            }
            else if (appMatch("ConsumerAffairs/Local Laws/Living Wage/Exemption",childId))
            {
                tag = "-EX";
            }
            else if (appMatch("ConsumerAffairs/Local Laws/Monitoring/NA",childId))
            {
                tag = "-MON";
            }
            else if (appMatch("ConsumerAffairs/Local Laws/Union Organizing/NA",childId))
            {
                tag = "-UO";
            }

           
            var childCustomId = childId.getCustomID();
            logDebug("Orginal child record ID: " + childCustomId);          
            logDebug("New record ID: " + contractId + tag);
            result = aa.cap.updateCapAltID(capId, contractId + tag);
            
            // Update custom field on new record
            editAppSpecific("Contract ID", contractId, childId);      
                
        }

    }

}
else
{
    // Get cap by custom alt ID
    contractParent = getApplication(contractId);
    logDebug("Retrieving ID for contract AltID: " + contractId);

    if (contractParent) {
        logDebug("Found contract ID and relate");
        addParent(contractParent);
        
        // Update Alt ID as well
        if (appTypeArray[2] == "Monitoring")
        {
            tag = "-MON";
        }
        else if (appTypeArray[2] == "Union Organizing")        
        {
            tag = "-UO";
        }
        else if (appTypeArray[2] == "Lawful Hiring")
        {
            tag = "-LH";
        }
        else if (appTypeArray[3] == "Exemption")
        {
            tag = "-EX";
        }

        result = aa.cap.updateCapAltID(capId, contractId + tag);

    }
}