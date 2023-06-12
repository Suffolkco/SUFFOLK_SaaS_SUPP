//Relate EnvHealth Records as children to entered Facility Record
if (appMatch("EnvHealth/Service Request/Variance/NA") || appMatch("EnvHealth/Service Request/Off-Premises/NA") || appMatch("EnvHealth/Complaint/Base/NA")) {
    var capIdPar = aa.cap.getCapID(getAppSpecific("Facility ID"));
    logDebug(capIdPar);
    if(capIdPar.getSuccess())
    {
        var parentId = capIdPar.getOutput();
        var linkResult = aa.cap.createAppHierarchy(parentId, capId);
    }
    //var cap = aa.env.getValue("CapModel");
    //var parentId = cap.getParentCapID();
}

