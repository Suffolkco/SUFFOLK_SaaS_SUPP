//CTRCA:CONSUMERAFFAIRS/*/*/*
//CTRCA;CONSUMERAFFAIRS!~!~!~.js
// copy First Name, Last Name; Business Name; Phone Number from contact type Vendor to Short Notes field
// copy Vendor address to record address
try{
    var newCap = checkTypeAndRename(capId);
    if (newCap){
    logDebug("new renewal CAP ID: " + newCap.getCustomID());
    }
   var contactType = "Vendor";
   var vendorInfo = getVendorInfo(contactType, capId);
   if(vendorInfo == false){
       logDebug("No vendor contact exists on this record");
   }else{
       // copy Vendor address to record address
       var vAddrLine1 = vendorInfo[0];
       var vCity = vendorInfo[1];
       var vState = vendorInfo[2];
       var vZip = vendorInfo[3];
       var vAddress = new Array();
       vAddress.push(vAddrLine1);
       vAddress.push(vCity);
       vAddress.push(vState);
       vAddress.push(vZip);
       createNewAddress(vAddress);
       // copy Vendor name, org name & phone to short notes
       var fName = vendorInfo[4];
       var lName = vendorInfo[5];
       var vbusiness = vendorInfo[6];
       var vPhone = vendorInfo[7];
       if(matches(vPhone, null, " ")){
           vPhone = " ";
       }
       var shortNotesString = fName + " " + lName + ", " + vbusiness + ", " + vPhone;
       updateShortNotes(shortNotesString);
   }
}catch(err){
   logDebug("**WARN: Error in CTRCA updating short notes and address -  " + err.message);
}
//var newCap = checkTypeAndRename(capId);
//logDebug("new renewal CAP ID: " + newCap.getCustomID());
//// functions - to be moved to INCLUDES_CUSTOM sometime later
//
//function getVendorInfo(cType, capId) {
//  var returnArray = new Array();
//  var haveCType = false;
//
//  var contModel = null;
//  var consResult = aa.people.getCapContactByCapID(capId);
//  if (consResult.getSuccess()) {
//      var cons = consResult.getOutput();
//      for (thisCon in cons) {
//          var capContactType = cons[thisCon].getCapContactModel().getPeople().getContactType();
//          if (capContactType == cType) {
//              var contModel = cons[thisCon].getCapContactModel();
//
//              var firstName = contModel.getFirstName();
//              var lastName = contModel.getLastName();
//              var business = contModel.getBusinessName();
//              var phone = contModel.getPhone1();
//              var addr1 = contModel.getAddressLine1();
//              var city = contModel.getCity();
//              var state = contModel.getState();
//              var zip = contModel.getZip();
//
//              // build returnArray
//              returnArray.push(addr1);
//              returnArray.push(city);
//              returnArray.push(state);
//              returnArray.push(zip);
//              returnArray.push(firstName);
//              returnArray.push(lastName);
//              returnArray.push(business);
//              returnArray.push(phone);
//              return returnArray;
//              haveCType = true;
//          }
//      }
//  }
//  if (haveCType == false){
//      return false;
//  }
//}
//
//function createNewAddress(address){
//  var newAddr1 = address[0];
//  var newCity = address[1];
//  var newState = address[2];
//  var newZip = address[3];
//
//  var newAddressModel = aa.proxyInvoker.newInstance("com.accela.aa.aamain.address.AddressModel").getOutput();
//  newAddressModel.setCapID(capId);
//  newAddressModel.setServiceProviderCode(aa.getServiceProviderCode());
//  newAddressModel.setAuditID("ADMIN");
//  newAddressModel.setPrimaryFlag("Y");
//
//// per customer - add address to BOTH AddressLine1 and StreetName
//  newAddressModel.setAddressLine1(newAddr1);
//  newAddressModel.setStreetName(newAddr1);
//  newAddressModel.setCity(newCity);
//  newAddressModel.setState(newState);
//  newAddressModel.setZip(newZip);
//
//  aa.address.createAddress(newAddressModel);
//  //logDebug("Added record address " + newAddr1 + ", " + newCity + ", " + newState + ", " + newZip + " successfully!");
//}
function checkTypeAndRename(capIdObj)
{
    var title = "checkTypeAndRename(): ";
    var newRecObj = null;
    var typesObj = {
        "ConsumerAffairs/ID Cards/Backflow Tester/Renewal": true,
        "ConsumerAffairs/ID Cards/Renewal/NA": true,
        "ConsumerAffairs/Licenses/Appliance Repair/Renewal": true,
        "ConsumerAffairs/Licenses/Commercial Paint/Renewal": true,
        "ConsumerAffairs/Licenses/Dry Cleaning/Renewal": true,
        "ConsumerAffairs/Licenses/Electrical Inspector/Renewal": true,
        "ConsumerAffairs/Licenses/Home Furnishing/Renewal": true,
        "ConsumerAffairs/Licenses/Home Improvement/Renewal": true,
        "ConsumerAffairs/Licenses/Liquid Waste/Renewal": true,
        "ConsumerAffairs/Licenses/Master Electrician/Renewal": true,
        "ConsumerAffairs/Licenses/Master Plumber/Renewal": true,
        "ConsumerAffairs/Licenses/Pet Cemetary/Renewal": true,
        "ConsumerAffairs/Licenses/Polygraph Examiner/Renewal": true,
       "ConsumerAffairs/Licenses/Precious Metal/Renewal": true,
        "ConsumerAffairs/Licenses/Restricted Electrical/Renewal": true,
        "ConsumerAffairs/Licenses/Restricted Plumbing/Renewal": true,
        "ConsumerAffairs/Licenses/Second Hand Dealer/Renewal": true,
        "ConsumerAffairs/Licenses/Sign Hanger/Renewal": true,
        "ConsumerAffairs/Licenses/Tax Grievance/Renewal": true,
        "ConsumerAffairs/Registrations/Swimming Pool Maintenance/Renewal": true,
        "ConsumerAffairs/Registrations/Renewal/NA": true,
        "ConsumerAffairs/TLC/Drivers/Renewal": true,
        "ConsumerAffairs/TLC/Renewal/NA": true,
        "ConsumerAffairs/TLC/Vehicles/Renewal": true,
    };
    var getCapResult = {};
    try
    {
        getCapResult = aa.cap.getCap(capIdObj);
    } catch (err)
    {
        logDebug(title + "Error in EMSE API: " + err.message);
        return newRecObj;
    }
    var capObj = {};
   if (!getCapResult.getSuccess())
    {
        logDebug(title + "Unable to retrieve CAP object. Message = " + getCapResult.getErrorMessage());
        return newRecObj;
    }
    capObj = getCapResult.getOutput();
    var capType = capObj.getCapType();
    if (typesObj[capType])
    {
        newRecObj = renamePermit(capIdObj);
    } else
    {
        logDebug(title + "Wrong record type to renew.");
    }
    return newRecObj;
}
function renamePermit(capIdObj)
{
    var title = "renamePermit(): ";
    var capIdString = capIdObj.getCustomID();
    var retval = null;
    //get the cap object
    var getCapResult = aa.cap.getCap(capIdObj);
    var capObj = {};
    if (!getCapResult.getSuccess())
    {
        logDebug(title + "Unable to retrieve CAP object. Message = " + getCapResult.getErrorMessage());
        return retval;
    }
    capObj = getCapResult.getOutput();
    var appTypeString = capObj.getCapType() + "";
    //retrieve parent cap for the same record type
    var parentCapObj = getParentLicense(capIdObj);
    if (parentCapObj == null)
    {
        logDebug(title + "No parent license available for record (" + capIdObj + ")");
        return retval;
    }
    var parentIdString = parentCapObj.getCustomID();
    var seqArr = [];
    var childrenArr = getChildren(appTypeString, parentCapObj);
    exploreObject(childrenArr);
    if (childrenArr)
    {
        for (var cIdx in childrenArr) 
        {
            if (childrenArr[cIdx].getCustomID().indexOf(parentIdString + '-REN') > -1)
            {
                var seqVal = parseInt(childrenArr[cIdx].getCustomID().replace(parentIdString + '-REN', ''));
                if (!isNaN(seqVal))
                {
                    seqArr.push(seqVal);
                }
            }
        }
    }
    var childNewAltId = parentCapObj.getCustomID() + '-REN01';
    if (seqArr.length > 0)
    {
        var lastSeq = seqArr.sort(function (a, b)
        {
            return b - a;
        })[0] + 1;
        childNewAltId = parentCapObj.getCustomID() + '-REN' + (String(lastSeq).length > 1 ? lastSeq : '0' + String(lastSeq));
    }
    var updateCapAltIdResult = aa.cap.updateCapAltID(capIdObj, childNewAltId);
    if (!updateCapAltIdResult.getSuccess())
    {
        logDebug(title + "Error updating record to renewal CAP Id. Message = " + updateCapAltIdResult.getErrorMessage());
        return retval;
    }
    var childCapIdResult = aa.cap.getCapID(childNewAltId);
    if (!childCapIdResult.getSuccess())
    {
        logDebug(title + "Unable to retrieve new child CAP Id. Message = " + childCapIdResult.getErrorMessage());
        return retval;
    }
    var childCapId = aa.cap.getCapID(childNewAltId).getOutput();
    return childCapId;
}
function getParentLicense(capIdObj)
{
    var title = "getParentLicense(): ";
    var parentLicObj = null;
    var parentLicArr = [];
    var getProjectResult = aa.cap.getProjectByChildCapID(capIdObj, "Renewal", null);
    if (!getProjectResult.getSuccess())
    {
        getProjectResult = aa.cap.getProjectByChildCapID(capIdObj, "EST", null);
    }
    parentLicArr = getProjectResult.getOutput();
    if (parentLicArr != null && parentLicArr.length > 0)
    {
        parentLicObj = parentLicArr[0];
    } else
    {
        logDebug(title + "No parent license for child license (" + capIdObj + ")");
    }
    var projIdStr = String(parentLicObj.getProjectID());
    var projIdArr = projIdStr.split('-');
    var parentCapIdObjResult = aa.cap.getCapID(projIdArr[0], projIdArr[1], projIdArr[2]);
    if (!parentCapIdObjResult.getSuccess())
    {
        logDebug(title + "Unable to retrieve the parent CapID object.");
        return null;
    }
    var parentCapIdObj = parentCapIdObjResult.getOutput();
    return parentCapIdObj;
}