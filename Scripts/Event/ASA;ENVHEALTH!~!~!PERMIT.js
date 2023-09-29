//Add the Program Identifier to the Structure portlet
eval(getScriptText("EH_FacilityStructureCustomFunctions"));
var programIdentifierString = getAppSpecific("Program Identifier");
if(!matches(programIdentifierString,null,undefined,"")){
    addBStructure(capId,1,"FACILITY",programIdentifierString,programIdentifierString);
}
