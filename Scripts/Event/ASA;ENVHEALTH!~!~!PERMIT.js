//Add the Program Identifier to the Structure portlet
eval(getScriptText("EH_FacilityStructureCustomFunctions"));
var programIdentifierString = getAppSpecific("Program Identifier");
if(!matches(programIdentifierString,null,undefined,"")){
    addBStructure(capId,1,"FACILITY",programIdentifierString,programIdentifierString);
}


var facilityCapId = getFacilityId(capId);
logDebug("FacilityCapId: " + facilityCapId);
if(!matches(facilityCapId,null,undefined,false)){
    // Copy Setpc/Sewage
    var disposalSystem = getAppSpecific("Septic/Sewage",facilityCapId);
    editAppSpecific("Septic/Sewage", disposalSystem);

    // Copy Sanitarian Area from Facility to FSP as San Area 
    var sanArea = getAppSpecific("Sanitarian Area",facilityCapId);
    editAppSpecific("SAN AREA", sanArea);

    // Copy Days/Hours of operation
    var daysOp = getAppSpecific("Days of Operation",facilityCapId);
    editAppSpecific("Days of Operation", daysOp);

    var hrsOp = getAppSpecific("Hours of Operation",facilityCapId);
    editAppSpecific("Hours of Operation", hrsOp);

}



function getFacilityId(vCapId){
    var facilityId = null;
    facilityId = getParentByCapId(vCapId);
    if(!matches(facilityId,null,undefined,"")){
        if(appMatch("EnvHealth/Facility/NA/NA",facilityId)){
            return facilityId;
        }else{
            // If Parent isnt a Facility, try the Gradparent
            facilityId = getParentByCapId(facilityId);
            if(!matches(facilityId,null,undefined,"")){
                if(appMatch("EnvHealth/Facility/NA/NA",facilityId)){
                    return facilityId;
                }
            }
        }
    }
    return false;
}
