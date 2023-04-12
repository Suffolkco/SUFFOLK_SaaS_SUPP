//ASA:DEQ/ECOLOGY/IA/TRANSFER

/*

Removing previous code JG 2.16.22 

var showDebug = false;
 
var parentId = getParent();
var b1ExpResult = aa.expiration.getLicensesByCapID(parentId);
var parAppArray = [];
var amAppArray = [];
var numArray = [];
var tranPropType = getAppSpecific("Type");
var tranPropUse = getAppSpecific("Use");

copyLicensedProf(parentId, capId);

editAppSpecific("Type", tranPropType, parentId);
editAppSpecific("Use", tranPropUse, parentId);

if (b1ExpResult.getSuccess())
{
    b1Exp = b1ExpResult.getOutput();
    var todaysDate = new Date();
    var todDateCon = (todaysDate.getMonth() + 1) + "/" + todaysDate.getDate() + "/" + (todaysDate.getFullYear());
    //logDebug("This is the current month: " + todaysDate.getMonth());
    //logDebug("This is the current day: " + todaysDate.getDate());
    //logDebug("This is the current year: " + todaysDate.getFullYear());
    b1Exp = b1ExpResult.getOutput();
    var dateAdd = addDays(todDateCon, 1095);
    var dateMMDDYYY = jsDateToMMDDYYYY(dateAdd);

    dateMMDDYYY = aa.date.parseDate(dateMMDDYYY);
    b1Exp.setExpDate(dateMMDDYYY);
    aa.expiration.editB1Expiration(b1Exp.getB1Expiration());      
}

var capContactResult = aa.people.getCapContactByCapID(parentId);
if (capContactResult.getSuccess()) 
{
    var parContacts = capContactResult.getOutput();
    logDebug(parContacts.length);
    for (con in parContacts)
    {
        var newContact = parContacts[con].getCapContactModel();
        //debugObject(newContact);
        if(newContact.getPeople().getContactType() == "Property Owner")
        {
            //Gathering all Applicants
            logDebug("Pushing Applicant into Array");
            parAppArray.push(newContact);
        }
    }
    for (par in parAppArray)
    {
        if (parAppArray[par].getPrimaryFlag() == "Y")
        {
            conName = parAppArray[par].getPeople().getFirstName();
            conStat = parAppArray[par].getPeople().getAuditStatus();
            logDebug(conName);
            logDebug(conStat);
            date = parAppArray[par].getPeople().getStartDate();
            logDebug(date);
            //Setting old Property Owner's Primary Flag to N and setting an End Date
            parAppArray[par].getPeople().setAuditStatus("I");
            parAppArray[par].setEndDate(new Date());
            parAppArray[par].setPrimaryFlag("N");

            aa.people.editCapContact(parAppArray[par]);

            endDate = parAppArray[par].getPeople().getEndDate();
            flag = parAppArray[par].getPrimaryFlag();

            logDebug(endDate);
            logDebug(flag);
            break;  
        }
    }
}

//Copying Applicant from Amendment to the Parent
copyContactsTransfer(capId, parentId);

var capContactResult = aa.people.getCapContactByCapID(parentId);
if (capContactResult.getSuccess()) 
{
    var parContacts = capContactResult.getOutput();
    logDebug(parContacts.length);
    for (con in parContacts)
    {
        var newContact = parContacts[con].getCapContactModel();
        if(newContact.getPeople().getContactType() == "Property Owner")
        {
            //Gathering all Applicants
            logDebug("Pushing Applicant into Array");
            amAppArray.push(newContact);
        }
    }
    for (var i = 0; i < amAppArray.length; i++)
    {  
        conName = amAppArray[i].getPeople().getFirstName();
        logDebug(conName);
        conNum = amAppArray[i].getPeople().getContactSeqNumber();
        numArray.push(parseInt(conNum));
        logDebug(conNum);
    }

    logDebug(numArray);
    var newSeq = Math.max.apply(null, numArray);
    logDebug(newSeq);

    for (var j = 0; j < amAppArray.length; j++)
    {
        if (amAppArray[j].getPeople().getContactSeqNumber() == newSeq)
        {
            date = amAppArray[j].getPeople().setStartDate(new Date());
            date = amAppArray[j].getPeople().getStartDate();
            logDebug(date);
            amAppArray[j].setPrimaryFlag("Y");

            aa.people.editCapContact(amAppArray[j]);

            flag = amAppArray[j].getPrimaryFlag();
            logDebug(flag); 
        }
    }
}

function addDays(date, days) 
{
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
function jsDateToMMDDYYYY(pJavaScriptDate) {
  //converts javascript date to string in MM/DD/YYYY format
  if (pJavaScriptDate != null) {
    if (Date.prototype.isPrototypeOf(pJavaScriptDate)) {
      return (pJavaScriptDate.getMonth() + 1).toString() + "/" + pJavaScriptDate.getDate() + "/" + pJavaScriptDate.getFullYear();
    } else {
      logDebug("Parameter is not a javascript date");
      return ("INVALID JAVASCRIPT DATE");
    }
  } else {
    logDebug("Parameter is null");
    return ("NULL PARAMETER VALUE");
  }
}
function copyContactsTransfer(pFromCapId, pToCapId) {
    //Copies all contacts from pFromCapId to pToCapId
    //07SSP-00037/SP5017
    //
    if (pToCapId == null)
     var vToCapId = capId;
    else
     var vToCapId = pToCapId;
   
   var capContactResult = aa.people.getCapContactByCapID(pFromCapId);
    var copied = 0;
    if (capContactResult.getSuccess()) {
     var Contacts = capContactResult.getOutput();
      for (yy in Contacts) {
        var newContact = Contacts[yy].getCapContactModel();
        if (Contacts[yy].getPeople().getContactType() == "Property Owner") {
  
      // Retrieve contact address list and set to related contact
        var contactAddressrs = aa.address.getContactAddressListByCapContact(newContact);
        if (contactAddressrs.getSuccess()) {
        var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());
        newContact.getPeople().setContactAddressList(contactAddressModelArr);
        }
        newContact.setCapID(vToCapId);
    
  
  
  
      // Create cap contact, contact address and contact template
        aa.people.createCapContactWithAttribute(newContact);
        copied++;
        //logDebug("Copied contact from " + pFromCapId.getCustomID() + " to " + vToCapId.getCustomID());
      }
    }
    } else {
     logMessage("**ERROR: Failed to get contacts: " + capContactResult.getErrorMessage());
     return false;
    }
    logDebug("Copied");
    return copied;
   }

   function copyLicensedProf(sCapId, tCapId)
{
  //Function will copy all licensed professionals from source CapID to target CapID

  var licProf = aa.licenseProfessional.getLicensedProfessionalsByCapID(sCapId).getOutput();
  if (licProf != null){
    for (x in licProf)
    {
        licProf[x].setCapID(tCapId);
        aa.licenseProfessional.createLicensedProfessional(licProf[x]);
    }
  }
  else{
  
    //logDebug("No licensed professional on source");
  }
}
*/

if (!publicUser)
{

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


    var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);
    if (capParcelResult.getSuccess())
    {var Parcels = capParcelResult.getOutput().toArray();}
    else
    {logDebug("**ERROR: getting parcels by cap ID: " + capParcelResult.getErrorMessage());}

    for (zz in Parcels)
    {
      var ParcelValidatedNumber = Parcels[zz].getParcelNumber();
      logDebug("There is a parcel number, we are checking for IAs now.");
    }

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
      addParent(iaNumber);
    }
  }
}