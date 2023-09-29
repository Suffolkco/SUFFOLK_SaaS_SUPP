function getPermitIDfromInspection(vFacilityID,inspIDNumArg){
    cldPmtAry = getChildren("EnvHealth/*/*/Permit",vFacilityID);
    for(x in cldPmtAry){
        var cldPmtCapId = cldPmtAry[x];
        var r = aa.inspection.getInspections(cldPmtCapId);
        if (r.getSuccess()) {
            var inspArray = r.getOutput();
            for (i in inspArray) {
                var inspModel = inspArray[i].getInspection();
                if(inspModel.getIdNumber() == inspIDNumArg){
                    return cldPmtCapId;
                }
            }
        }
    }
    return false;
 }