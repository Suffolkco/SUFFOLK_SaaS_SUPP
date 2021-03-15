//This will update 7 fields on the parent site record.
var showDebug = false;
var parentCap = getParent(capId);
var status = false;

var tankNumber = getAppSpecific("SCDHS Tank #", capId);
logDebug("This is the tank we are looking for: " + tankNumber);
 

logDebug("Identified: " + parentCap.getCustomID() + " as the parent.");
if(!matches(tankNumber, undefined, null, "null", "", "undefined"))
{
    logDebug("inside first if.");
   status =   editASITableRowViaRowIdentifer(parentCap, "TANK INFORMATION", "Tank #", tankNumber, tankNumber, "Tank #");
  logDebug("This is the returned Status: " + status);
    
}

if(!matches(tankNumber, undefined, null, "null", "", "undefined"))
{
var storageType = getAppSpecific("Storage Type", capId);
logDebug("Storage Type: " + storageType);
if(!matches(storageType, undefined, null, "null", "", "undefined") && status == true)
{
    logDebug("inside first if.");
    editASITableRowViaRowIdentifer(parentCap, "TANK INFORMATION", "Storage Type", storageType, tankNumber, "Tank #");
    
}
var location = getAppSpecific("Tank Location", capId);
if(!matches(location, undefined, null, "null", "", "undefined")&& status == true)
{
    editASITableRowViaRowIdentifer(parentCap, "TANK INFORMATION", "Location", location, tankNumber, "Tank #");
}
var capacity = getAppSpecific("Capacity", capId);
if(!matches(capacity, undefined, null, "null", "", "undefined")&& status == true)
{
    editASITableRowViaRowIdentifer(parentCap, "TANK INFORMATION", "Capacity", capacity, tankNumber, "Tank #");
}
var contents = getAppSpecific("Product Stored Label", capId);
if(!matches(contents, undefined, null, "null", "", "undefined")&& status == true)
{
    editASITableRowViaRowIdentifer(parentCap, "TANK INFORMATION", "Contents", contents, tankNumber, "Tank #");
}
var article7 = getAppSpecific("Article 7 Reg", capId);
logDebug("article7: " + article7)
if(!matches(article7, undefined, null, "null", "", "undefined")&& status == true)
{
    editASITableRowViaRowIdentifer(parentCap, "TANK INFORMATION", "Article 7", article7, tankNumber, "Tank #");
}
var article18 = getAppSpecific("Article 18 Reg", capId);
logDebug("article18: " + article18)

if(!matches(article18, undefined, null, "null", "", "undefined")&& status == true)
{
    editASITableRowViaRowIdentifer(parentCap, "TANK INFORMATION", "Article 18", article18, tankNumber, "Tank #");
}
var officialUseCode = getAppSpecific("Official Use Code", capId);
if(!matches(officialUseCode, undefined, null, "null", "", "undefined")&& status == true)
{
    editASITableRowViaRowIdentifer(parentCap, "TANK INFORMATION", "Official Use Code", officialUseCode, tankNumber, "Tank #");
}

if(!status)
{
    var dictionary = {};
    

    dictionary["Tank #"] = tankNumber;
    dictionary["Storage Type"]= storageType;
    dictionary["Location"]= location;
    dictionary["Capacity"]= capacity;
    dictionary["Contents"]= contents;
    dictionary["Article 7"]= article7;
    dictionary["Article 18"]= article18;
    dictionary["Official Use Code"]= officialUseCode;
    logDebug("Status is false. Lets add a row.");
    logDebug(dictionary);
    addToASITable("TANK INFORMATION", dictionary,parentCap );

}

}
