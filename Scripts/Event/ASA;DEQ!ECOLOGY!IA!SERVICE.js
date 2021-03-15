//ASA:DEQ/ECOLOGY/IA/SERVICE

    var parentId = getParent();
    if (parentId)
    {
        copyContacts(parentId, capId);
        copyParcel(parentId, capId);
        copyAddress(parentId, capId);

        var parMan = getAppSpecific("Manufacturer", parentId);
        var parMod = getAppSpecific("Model Number", parentId);
        var parInDate = getAppSpecific("Installation Date", parentId);

        editAppSpecific("IA Application Number", parentId.getCustomID(), capId);
        editAppSpecific("Manufacturer",parMan, capId);
        editAppSpecific("Model Number",parMod, capId);
        editAppSpecific("Installation Date",parInDate, capId);
    }
    var contractTerm = getAppSpecific("Contract Term");
    var contractStartDate = getAppSpecific("Contract Start Date");
    logDebug("Contract Term: " + contractTerm);
    var contractUpdate = getAppSpecific("Contract Update");
    logDebug("Contract Update: " + contractUpdate);
    if(contractUpdate == "CHECKED" || contractUpdate == "YES")
    {
        var dateContractExpDate  = new Date(contractStartDate);
        if (contractTerm == "1 year")
        {
            logDebug("inside 1 year.");
            dateContractExpDate =  (dateContractExpDate.getMonth() + 1) + "/" + (dateContractExpDate.getDate()) + "/" + (dateContractExpDate.getFullYear() + 1);
            logDebug("New Date: " + dateContractExpDate);
            editAppSpecific("Contract Expiration Date", dateContractExpDate);
        }
        if (contractTerm == "3 year")
        {
            logDebug("inside 3 year");
            dateContractExpDate =  (dateContractExpDate.getMonth() + 1) + "/" + (dateContractExpDate.getDate()) + "/" + (dateContractExpDate.getFullYear() + 3);
            logDebug("New Date: " + dateContractExpDate);
            editAppSpecific("Contract Expiration Date", dateContractExpDate);
        }
    }
    var serviceReport = getAppSpecific("Service Report");
    if(serviceReport == "CHECKED" || serviceReport == "YES")
    {
        useAppSpecificGroupName = true;

        var nextServiceDate = new Date(getAppSpecific("SERVICE INFORMATION.Service Date"));
        nextServiceDate =  (nextServiceDate.getMonth() + 1) + "/" + (nextServiceDate.getDate()) + "/" + (nextServiceDate.getFullYear() + 1);
        logDebug("Next Service Date: " + nextServiceDate);
        editAppSpecific("CONTRACT INFORMATION.Next Service Date", nextServiceDate);
        editAppSpecific("SERVICE INFORMATION.Next Service Date", nextServiceDate);
        editAppSpecific("CONTRACT INFORMATION.Next Service Date", nextServiceDate, parentId);
    }
    var sampleResults = getAppSpecific("Sample Results");
    if(sampleResults == "CHECKED" || sampleResults == "YES")
    {
        useAppSpecificGroupName = false;
        var sampleDueDate = new Date(getAppSpecific("Sample Collection Date"));
        var dateAddedSampleDueDate = (sampleDueDate.getMonth() + 1) + "/" + (sampleDueDate.getDate()) + "/" + (sampleDueDate.getFullYear() + 3);
        logDebug("Sample Due Date: " + dateAddedSampleDueDate);
        editAppSpecific("Next Sample Date", dateAddedSampleDueDate, parentId);
    }
