if (publicUser)
{
  // var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);
  // if (capParcelResult.getSuccess())
  // { 
  //   //JG Commenting out to work around Accela 22.1 APO updates
  //   //var Parcels = capParcelResult.getOutput().toArray(); 
  //   var Parcels = capParcelResult.getOutput().toArray();
  // } 
  // else
  // { logDebug("**ERROR: getting parcels by cap ID: " + capParcelResult.getErrorMessage()); }

  // for (zz in Parcels)
  // {

  //    var ParcelValidatedNumber = Parcels[zz].getParcelNumber();
  //    logDebug("There is a parcel number, we are checking for IAs now."); 


  // }
  var pin = AInfo["PIN Number"];
  var iaNumber = AInfo["IA Record Number"];

  if (matches(pin, "", null, undefined) || matches(iaNumber, "", null, undefined))
  {
    updateAppStatus("Record Search", "");
  }
  else
  {
    /*
opted not to use parcel search method and just to link via ASI entry instead - Ryan Littlefield, 4/12/2023, per Jen Freese

    var parcelTest = aa.parcel.getParcelByCapId(capId, null)
    logDebug("parcelTest = " + parcelTest);
    logDebug("parcelTest output = " + parcelTest.getOutput());
    var parcelTestOutput = parcelTest.getOutput().toArray();
    var parcelOutputArray = [];
    for (p in parcelTestOutput)
    {
      logDebug("value is: " + parcelTestOutput[p]);
      var ParcelForArray = parcelTestOutput[p].toString().split(": ");
      logDebug("parcelForArray = " + ParcelForArray);
      parcelOutputArray.push(ParcelForArray[1]);

    }
    logDebug("parcelOutputArray = " + parcelOutputArray);
    var ParcelValidatedNumber = parcelOutputArray[0];

    var foundIA = false;
    var iaCap = "";
    var listOfRelatedRecordsFromParcel = capIdsGetByParcel(ParcelValidatedNumber);


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
    logDebug("getCapResult = " + getCapResult);
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
        logDebug("We found a match and it is " + wwmIA);
        //Set globally true if there's a site.
        foundIA = true;
        iaCap = relCap;
      }
    }

    logDebug("foundIA = " + foundIA);

    */
   
    if (iaNumber != "")
    {
      logDebug("We found a matching IA record: " + iaNumber);
      //addParent(iaNumber);
      //EHIMS 5119 Fix errors by removing the accela function addParent and replace by the below
      var getCapResult = aa.cap.getCapID(iaNumber);
      if (getCapResult.getSuccess())
      {
        var parentId = getCapResult.getOutput();
        var linkResult = aa.cap.createAppHierarchy(parentId, capId);
        if (linkResult.getSuccess())
          logDebug("Successfully linked to Parent Application : " + iaNumber);
        else
          logDebug( "**ERROR: linking to parent application parent cap id (" + iaNumber + "): " + linkResult.getErrorMessage());
        
      }
      else
      { logDebug( "**ERROR: getting parent cap id (" + iaNumber + "): " + getCapResult.getErrorMessage()) }
      
    }
  }
}
