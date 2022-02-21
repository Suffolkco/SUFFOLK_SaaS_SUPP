if (publicUser)
{
var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);
if (capParcelResult.getSuccess())
{ var Parcels = capParcelResult.getOutput().toArray(); } 
else
{ logDebug("**ERROR: getting parcels by cap ID: " + capParcelResult.getErrorMessage()); }

for (zz in Parcels)
{
  var ParcelValidatedNumber = Parcels[zz].getParcelNumber();
  logDebug("There is a parcel number, we are checking for IAs now.");  
}

var foundIA = false;
var iaCap = "";
var listOfRelatedRecordsFromParcel = capIdsGetByParcel(ParcelValidatedNumber);
var pin = AInfo["PIN Number"];
var iaNumber = AInfo["IA Record Number"];

var getCapResult = aa.cap.getCapIDsByAppSpecificInfoField("IA PIN Number", pin);
    if (getCapResult.getSuccess())
    {
        var apsArray = getCapResult.getOutput();
        for (aps in apsArray)
        {
            myCap = aa.cap.getCap(apsArray[aps].getCapID()).getOutput();
            logDebug("apsArray = " + apsArray);
            var relCap = myCap.getCapID();
            var relCapID = relCap.getCustomID();
        }
    }

    var getCapResult = aa.cap.getCapID(iaNumber);
    if (getCapResult.getSuccess() && matches(relCapID, iaNumber))
    {
        var wwmIA = getCapResult.getOutput().getCustomID();
        logDebug("wwmIA = " + wwmIA);
    }

    


for (record in listOfRelatedRecordsFromParcel) 
{
  //Here we will pull out the cap. 
  //We are looking for a related IA record for this particular Parcel Number
  var item = listOfRelatedRecordsFromParcel[record];
  logDebug("item = " + item);
  var itemCapID = item.getCustomID();
  logDebug("We found this record: " + itemCapID);
  if (matches(itemCapID, wwmIA))
  {
      logDebug ("We found a match and it is " + wwmIA);
    //Set globally true if there's a site.
    foundIA = true;
    iaCap = relCap;
  }
}

logDebug ("foundIA = " + foundIA);
  if (foundIA)
  {
    logDebug("We found a matching IA record: " + iaCap);
    addParent(iaCap);
  }
}
