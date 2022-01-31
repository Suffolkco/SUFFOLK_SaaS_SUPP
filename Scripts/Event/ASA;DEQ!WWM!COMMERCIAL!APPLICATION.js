//ASA:DEQ/WWM/Commercial/Application//

var flowApp = AInfo["Flow to be approved under this application"];
var feeEx = AInfo["Fee Exempt"];

if (feeEx == "No" || feeEx == null)
{
     if (flowApp != null)
    {
        if (parseInt(flowApp) <= 1000)
        {
			updateFee("COM-1K", "DEQ_OSFR", "FINAL", 1, "Y");
			updateFee("COM-1K+", "DEQ_OSFR", "FINAL", 0, "Y");
			updateFee("COM-10K+", "DEQ_OSFR", "FINAL", 0, "Y");
        }
        if (parseInt(flowApp) > 1000 && flowApp <= 10000)
        {
			updateFee("COM-1K+", "DEQ_OSFR", "FINAL", 1, "Y");
			updateFee("COM-1K", "DEQ_OSFR", "FINAL", 0, "Y");
			updateFee("COM-10K+", "DEQ_OSFR", "FINAL", 0, "Y");
        }
        if (parseInt(flowApp) > 10000)
        {
			updateFee("COM-10K+", "DEQ_OSFR", "FINAL", 1, "Y");
			updateFee("COM-1K", "DEQ_OSFR", "FINAL", 0, "Y");
			updateFee("COM-1K+", "DEQ_OSFR", "FINAL", 0, "Y");
        }
    } 
}

// Add BOR fee if the custom field is set to Yes by public user
if (publicUser)
{
	var bor = AInfo["Are you applying for a Board of Review(BOR) hearing at this time? If yes, submit form WWM"];
	
	if (bor == 'Yes')
	{
	    addFee("BOR", "DEQ_OSFR", "FINAL", 1, "Y")
	}
}


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
