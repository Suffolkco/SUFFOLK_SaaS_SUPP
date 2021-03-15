//ASA:DEQ/WWM/RESIDENCE/APPLICATION

var methWat = AInfo["Method of Water Supply"];
var methSew = AInfo["Method of Sewage Disposal"];
var feeEx = AInfo["Fee Exempt"];
var countyState = AInfo["Is this application part of the County/State I/A OWTS SIP grant/loan program?"]

//if (countyState == "No" || countyState == null)
//{
	if (feeEx == "No" || feeEx == null )
	{
		if (methSew.equals("Public Sewers")  ||
		methSew.equals("Construct an STP") ||
		methSew.equals("Existing STP"))
		{
			updateFee("RES-PW-PS", "DEQ_SFR", "FINAL", 1, "Y");
		}
		else
		{
			updateFee("RES-PW-PS", "DEQ_SFR", "FINAL", 0, "Y");
		}
		if (methWat.equals("Private Well"))
		{
			updateFee("RES-WELL-OWT", "DEQ_SFR", "FINAL", 1, "Y");
			
			if (feeExists("RES-PW-OWTS"))
			{
				updateFee("RES-PW-OWTS", "DEQ_SFR", "FINAL", 0, "Y");
			}
		}
		else if (methWat.equals("Public Water"))
		{
			if (feeExists("RES-WELL-OWT"))
			{
				updateFee("RES-WELL-OWT", "DEQ_SFR", "FINAL", 0, "Y");
			}
			if (methSew.equals("Conventional Septic System") || methSew.equals("I/A System"))
			{
				updateFee("RES-PW-OWTS", "DEQ_SFR", "FINAL", 1, "Y");
				
			}
			else
			{
				updateFee("RES-PW-OWTS", "DEQ_SFR", "FINAL", 0, "Y");
			}
		} 
		else 
		{
			logDebug("No Fee.");
		}
	}
//}

var capmodel = aa.cap.getCap(capId).getOutput().getCapModel();
if(capmodel.isCompleteCap() && capmodel.getCreatedByACA() == "N")
{
	var b1ExpResult = aa.expiration.getLicensesByCapID(capId);
	if (b1ExpResult.getSuccess())
	{
		b1Exp = b1ExpResult.getOutput();
		var todaysDate = new Date();
		var todDateCon = (todaysDate.getMonth() + 1) + "/" + todaysDate.getDate() + "/" + (todaysDate.getFullYear());
		//logDebug("This is the current month: " + todaysDate.getMonth());
		//logDebug("This is the current day: " + todaysDate.getDate());
		//logDebug("This is the current year: " + todaysDate.getFullYear());
		b1Exp = b1ExpResult.getOutput();
		var dateAdd = addDays(todDateCon, 2190);
		var dateMMDDYYY = jsDateToMMDDYYYY(dateAdd);

		dateMMDDYYY = aa.date.parseDate(dateMMDDYYY);
		b1Exp.setExpDate(dateMMDDYYY);
		b1Exp.setExpStatus("Pending");
		aa.expiration.editB1Expiration(b1Exp.getB1Expiration());      
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

function createChild(grp,typ,stype,cat,desc) // optional parent capId
{
	//
	// creates the new application and returns the capID object
	//

	var itemCap = capId
	if (arguments.length > 5) itemCap = arguments[5]; // use cap ID specified in args
	
	var appCreateResult = aa.cap.createApp(grp,typ,stype,cat,desc);
	logDebug("creating cap " + grp + "/" + typ + "/" + stype + "/" + cat);
	if (appCreateResult.getSuccess())
		{
		var newId = appCreateResult.getOutput();
		logDebug("cap " + grp + "/" + typ + "/" + stype + "/" + cat + " created successfully ");
		
		// create Detail Record
		capModel = aa.cap.newCapScriptModel().getOutput();
		capDetailModel = capModel.getCapModel().getCapDetailModel();
		capDetailModel.setCapID(newId);
		aa.cap.createCapDetail(capDetailModel);

		var newObj = aa.cap.getCap(newId).getOutput();	//Cap object
		var result = aa.cap.createAppHierarchy(itemCap, newId); 
		if (result.getSuccess())
			logDebug("Child application successfully linked");
		else
			logDebug("Could not link applications");

		// Copy Parcels

		var capParcelResult = aa.parcel.getParcelandAttribute(itemCap,null);
		if (capParcelResult.getSuccess())
			{
			var Parcels = capParcelResult.getOutput().toArray();
			for (zz in Parcels)
				{
				logDebug("adding parcel #" + zz + " = " + Parcels[zz].getParcelNumber());
				var newCapParcel = aa.parcel.getCapParcelModel().getOutput();
				newCapParcel.setParcelModel(Parcels[zz]);
				newCapParcel.setCapIDModel(newId);
				newCapParcel.setL1ParcelNo(Parcels[zz].getParcelNumber());
				newCapParcel.setParcelNo(Parcels[zz].getParcelNumber());
				aa.parcel.createCapParcel(newCapParcel);
				}
			}

		// Copy Contacts
		capContactResult = aa.people.getCapContactByCapID(itemCap);
		if (capContactResult.getSuccess())
			{
			Contacts = capContactResult.getOutput();
			for (yy in Contacts)
				{
				var newContact = Contacts[yy].getCapContactModel();
				newContact.setCapID(newId);
				aa.people.createCapContact(newContact);
				logDebug("added contact");
				}
			}	

		// Copy Addresses
		capAddressResult = aa.address.getAddressByCapId(itemCap);
		if (capAddressResult.getSuccess())
			{
			Address = capAddressResult.getOutput();
			for (yy in Address)
				{
				newAddress = Address[yy];
				newAddress.setCapID(newId);
				aa.address.createAddress(newAddress);
				logDebug("added address");
				}
			}
		
		return newId;
		}
	else
		{
		logDebug( "**ERROR: adding child App: " + appCreateResult.getErrorMessage());
		}
}
