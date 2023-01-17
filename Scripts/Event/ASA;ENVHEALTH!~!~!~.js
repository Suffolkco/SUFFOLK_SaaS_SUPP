if (appMatch("EnvHealth/Health Program/Food Protection/Application")) {
	var numberOfSeats = getAppSpecific("Number of Seats");
	var typeOfEstablishment = getAppSpecific("Type of Establishment");
		if ((typeOfEstablishment == "Restaurant (With seating)") && (parseInt(numberOfSeats) >= 0 && parseInt(numberOfSeats) <= 16)) {
		var invFee = "Y";
		updateFee("101A", "EH_FP_APP", "FINAL", 1, invFee);
	}
		if ((typeOfEstablishment == "Restaurant (With seating)") && (parseInt(numberOfSeats) >= 17 && parseInt(numberOfSeats) <= 49)) {
		var invFee = "Y";
		updateFee("101B", "EH_FP_APP", "FINAL", 1, invFee);
	}
		if ((typeOfEstablishment == "Restaurant (With seating)") && (parseInt(numberOfSeats) >= 50 && parseInt(numberOfSeats) <= 100)) {
		var invFee = "Y";
		updateFee("101C", "EH_FP_APP", "FINAL", 1, invFee);
	}
		if ((typeOfEstablishment == "Restaurant (With seating)") && (parseInt(numberOfSeats) >= 101 && parseInt(numberOfSeats) <= 200)) {
		var invFee = "Y";
		updateFee("101D", "EH_FP_APP", "FINAL", 1, invFee);
	}
		if ((typeOfEstablishment == "Restaurant (With seating)") && (parseInt(numberOfSeats) >= 201)) {
		var invFee = "Y";
		updateFee("101E", "EH_FP_APP", "FINAL", 1, invFee);
	}
		if ((typeOfEstablishment == "Restaurant (Without seating)") && (parseInt(numberOfSeats) >= 0 && parseInt(numberOfSeats) <= 16)) {
		var invFee = "Y";
		updateFee("101A", "EH_FP_APP", "FINAL", 1, invFee);
	}
		if ((typeOfEstablishment == "Restaurant (Without seating)") && (parseInt(numberOfSeats) >= 17 && parseInt(numberOfSeats) <= 49)) {
		var invFee = "Y";
		updateFee("101B", "EH_FP_APP", "FINAL", 1, invFee);
	}
		if ((typeOfEstablishment == "Restaurant (Without seating)") && (parseInt(numberOfSeats) >= 50 && parseInt(numberOfSeats) <= 100)) {
		var invFee = "Y";
		updateFee("101C", "EH_FP_APP", "FINAL", 1, invFee);
	}
		if ((typeOfEstablishment == "Restaurant (Without seating)") && (parseInt(numberOfSeats) >= 101 && parseInt(numberOfSeats) <= 200)) {
		var invFee = "Y";
		updateFee("101D", "EH_FP_APP", "FINAL", 1, invFee);
	}
		if ((typeOfEstablishment == "Restaurant (Without seating)") && (parseInt(numberOfSeats) >= 201)) {
		var invFee = "Y";
		updateFee("101E", "EH_FP_APP", "FINAL", 1, invFee);
	}
		if (typeOfEstablishment == "Tavern") {
		var invFee = "Y";
		updateFee("1193", "EH_FP_APP", "FINAL", 1, invFee);
	}
		if  (typeOfEstablishment == "Bakery") {
		var invFee = "Y";
		updateFee("1351", "EH_FP_APP", "FINAL", 1, invFee);
	}
		if  (typeOfEstablishment == "Delicatessen") {
		var invFee = "Y";
		updateFee("1111", "EH_FP_APP", "FINAL", 1, invFee);
	}
		if  (typeOfEstablishment == "Frozen Dessert") {
		var invFee = "Y";
		updateFee("1402", "EH_FP_APP", "FINAL", 1, invFee);
	}
		if  (typeOfEstablishment == "Off-premise Caterer") {
		var invFee = "Y";
		updateFee("1211", "EH_FP_APP", "FINAL", 1, invFee);
	}
		if  (typeOfEstablishment == "In-Home Caterer") {
		var invFee = "Y";
		updateFee("1223", "EH_FP_APP", "FINAL", 1, invFee);
	}
		if  (typeOfEstablishment == "Commissary") {
		var invFee = "Y";
		updateFee("1201", "EH_FP_APP", "FINAL", 1, invFee);
	}
		if  (typeOfEstablishment == "School with Outside Caterer") {
		var invFee = "Y";
		updateFee("151M", "EH_FP_APP", "FINAL", 1, invFee);
	}
		if ( typeOfEstablishment == "Party Room") {
		var invFee = "Y";
		updateFee("PRTYRM01", "EH_FP_APP", "FINAL", 1, invFee);
	}
		if  (typeOfEstablishment == "Depot w/o Food Preparation") {
		var invFee = "Y";
		updateFee("1413", "EH_FP_APP", "FINAL", 1, invFee);
	}
	//	if  (typeOfEstablishment == "SED Summer Feeding") {
	//	var invFee = "Y";
	//	updateFee("1913", "EH_FP_APP", "FINAL", 1, invFee);
	//}
	//	if  (typeOfEstablishment == "Soup Kitchen") {
	//	var invFee = "Y";
	//	updateFee("1751", "EH_FP_APP", "FINAL", 1, invFee);
	//}
	//	if  (typeOfEstablishment == "Staffed Vending") {
	//	var invFee = "Y";
	//	updateFee("1133", "EH_FP_APP", "FINAL", 1, invFee);
	//}
	//	if  (typeOfEstablishment == "Senior Nutrition") {
	//	var invFee = "Y";
	//	updateFee("1901", "EH_FP_APP", "FINAL", 1, invFee);
	//}
}

if (appMatch("EnvHealth/Health Program/Mobile/Application")) {
	var numberOfVesselSeats = getAppSpecific("Number of Dinner Cruise Vessel Seats")
	var oneOrTwoYears = getAppSpecific("Are you applying for a 1-year or 2-year permit?");
	var typeOfEstablishment = getAppSpecific("Type of Establishment");
	if ((typeOfEstablishment == "Kiosk") && (oneOrTwoYears = "1-Year")) {
		var invFee = "Y";
		updateFee("LMA01", "EH_FP_APP", "FINAL", 1, invFee);
	}
	if  ((typeOfEstablishment == "Kiosk") && (oneOrTwoYears = "2-Year")) {
		var invFee = "Y";
		updateFee("LMA01", "EH_FP_APP", "FINAL", 2, invFee);
	}
	if  ((typeOfEstablishment == "Pushcart") && (oneOrTwoYears = "1-Year")) {
		var invFee = "Y";
		updateFee("LMA01", "EH_FP_APP", "FINAL", 1, invFee);
	}
	if  ((typeOfEstablishment == "Pushcart") && (oneOrTwoYears = "2-Year")) {
		var invFee = "Y";
		updateFee("LMA01", "EH_FP_APP", "FINAL", 2, invFee);
	}
	if  ((typeOfEstablishment == "Hot Dog Truck") && (oneOrTwoYears = "1-Year")) {
		var invFee = "Y";
		updateFee("LMA01", "EH_FP_APP", "FINAL", 1, invFee);
	}
	if  ((typeOfEstablishment == "Hot Dog Truck") && (oneOrTwoYears = "2-Year")) {
		var invFee = "Y";
		updateFee("LMA01", "EH_FP_APP", "FINAL", 2, invFee);
	}
	if  ((typeOfEstablishment == "Frozen Dessert Vehicle") && (oneOrTwoYears = "1-Year")) {
		var invFee = "Y";
		updateFee("LMA01", "EH_FP_APP", "FINAL", 1, invFee);
	}
	if  ((typeOfEstablishment == "Frozen Dessert Vehicle") && (oneOrTwoYears = "2-Year")) {
		var invFee = "Y";
		updateFee("LMA01", "EH_FP_APP", "FINAL", 2, invFee);
	}
	if  ((typeOfEstablishment == "Coffee Truck") && (oneOrTwoYears = "1-Year")) {
		var invFee = "Y";
		updateFee("LMA01", "EH_FP_APP", "FINAL", 1, invFee);
	}
	if  ((typeOfEstablishment == "Coffee Truck") && (oneOrTwoYears = "2-Year")) {
		var invFee = "Y";
		updateFee("LMA01", "EH_FP_APP", "FINAL", 2, invFee);
	}
	if  ((typeOfEstablishment == "Off-Premises Catering Vehicle") && (oneOrTwoYears = "1-Year")) {
		var invFee = "Y";
		updateFee("LMA01", "EH_FP_APP", "FINAL", 1, invFee);
	}
	if  ((typeOfEstablishment == "Off-Premises Catering Vehicle") && (oneOrTwoYears = "2-Year")) {
		var invFee = "Y";
		updateFee("LMA01", "EH_FP_APP", "FINAL", 2, invFee);
	}
	if  ((typeOfEstablishment == "Special Event Vehicle") && (oneOrTwoYears = "1-Year")) {
		var invFee = "Y";
		updateFee("LMA01", "EH_FP_APP", "FINAL", 1, invFee);
	}
	if  ((typeOfEstablishment == "Special Event Vehicle") && (oneOrTwoYears = "2-Year")) {
		var invFee = "Y";
		updateFee("LMA01", "EH_FP_APP", "FINAL", 2, invFee);
	}
	if  ((typeOfEstablishment == "Food Delivery Service") && (oneOrTwoYears = "1-Year")) {
		var invFee = "Y";
		updateFee("LMA01", "EH_FP_APP", "FINAL", 1, invFee);
	}
	if  ((typeOfEstablishment == "Food Delivery Service") && (oneOrTwoYears = "2-Year")) {
		var invFee = "Y";
		updateFee("LMA01", "EH_FP_APP", "FINAL", 2, invFee);
	}
	if  (( typeOfEstablishment == "Mobile Fast-Food Restaurant") && (oneOrTwoYears = "1-Year")) {
		var invFee = "Y";
		updateFee("LMA01", "EH_FP_APP", "FINAL", 1, invFee);
	}
	if  (( typeOfEstablishment == "Mobile Fast-Food Restaurant") && (oneOrTwoYears = "2-Year")) {
		var invFee = "Y";
		updateFee("LMA01", "EH_FP_APP", "FINAL", 2, invFee);
	}
	if  ((typeOfEstablishment == "Mobile Dining Vehicle") && (oneOrTwoYears = "1-Year")) {
		var invFee = "Y";
		updateFee("LMA01", "EH_FP_APP", "FINAL", 1, invFee);
	}
	if  ((typeOfEstablishment == "Mobile Dining Vehicle") && (oneOrTwoYears = "2-Year")) {
		var invFee = "Y";
		updateFee("LMA01", "EH_FP_APP", "FINAL", 2, invFee);
	}
	if ((typeOfEstablishment == "Dinner Cruise Vessel") && (parseInt(numberOfVesselSeats) > 0 && parseInt(numberOfVesselSeats) <= 16)) {
		var invFee = "Y";
		updateFee("311A", "EH_FP_APP", "FINAL", 1, invFee);
	}
	if ((typeOfEstablishment == "Dinner Cruise Vessel") && (parseInt(numberOfVesselSeats) >= 17 && parseInt(numberOfVesselSeats) <= 49)) {
		var invFee = "Y";
		updateFee("311B", "EH_FP_APP", "FINAL", 1, invFee);
	}
	if ((typeOfEstablishment == "Dinner Cruise Vessel") && (parseInt(numberOfVesselSeats) >= 50 && parseInt(numberOfVesselSeats) <= 100)) {
		var invFee = "Y";
		updateFee("311C", "EH_FP_APP", "FINAL", 1, invFee);
	}
	if ((typeOfEstablishment == "Dinner Cruise Vessel") && (parseInt(numberOfVesselSeats) >= 101 && parseInt(numberOfVesselSeats) <= 200)) {
		var invFee = "Y";
		updateFee("311D", "EH_FP_APP", "FINAL", 1, invFee);
	}
	if ((typeOfEstablishment == "Dinner Cruise Vessel") && (parseInt(numberOfVesselSeats) >= 201)) {
		var invFee = "Y";
		updateFee("311E", "EH_FP_APP", "FINAL", 1, invFee);
	}
}

if (appMatch("EnvHealth/Temporary Event/Annual Molluscan Shellfish/Application")) {
		var invFee = "Y";
		updateFee("1341", "EH_FP_APP", "FINAL", 1, invFee);
}

if (appMatch("EnvHealth/Temporary Event/Annual Sampling/Application")) {
		var invFee = "Y";
		updateFee("1333", "EH_FP_APP", "FINAL", 1, invFee);
}

if (appMatch("EnvHealth/Temporary Event/Organizer/Application")) {
	var invFee = "Y";
	updateFee("TEORG01", "EH_FP_APP", "FINAL", 1, invFee);
		
	//Late fees
	var eventStartDate = getAppSpecific("Opening Date"); //this date is working
	var today = aa.date.getCurrentDate();
	var vtoday = dateFormatted(today.getMonth(), today.getDayOfMonth(), today.getYear()); //this date is working to pull in today
	var todayPlusTwentyOne = dateAdd(vtoday, 21);
	var numDaysDiff = dateDiff(vtoday,eventStartDate)
	if ((numDaysDiff <= 21) && (numDaysDiff > 0)){
		addFee("TEMELATE01", "EH_FP_APP", "FINAL", 1, invFee);
	}
}


if (appMatch("EnvHealth/Temporary Event/Vendor/Application")) {
	//base fee single
	var numberOfEvents = getAppSpecific("Number of Events");
	var multFlag = getAppSpecific("Will you be applying for more than one event?");
	var invFee = "Y";
	if (multFlag == ("No")) {
	updateFee("TEVND01", "EH_FP_APP", "FINAL", 1, invFee);
	}
	//base fee mult
	var numberOfEvents = getAppSpecific("Number of Events");
	var multFlag = getAppSpecific("Will you be applying for more than one event?");
	var invFee = "Y";
	if (multFlag == ("Yes") && numberOfEvents > 1) {
	updateFee("TEMULT01", "EH_FP_APP", "FINAL", parseInt(numberOfEvents), invFee);
	}
	
	//Late Fees for Multiple Temporary Event
	var numberOfEvents = getAppSpecific("Number of Events");
	var multFlag = getAppSpecific("Will you be applying for more than one event?");
	loadASITables(capId);
	var hearingDatesASIT = loadASITable("EVENT INFORMATION");
	if(hearingDatesASIT.length > 0)
	{
		for(eachrow1st in hearingDatesASIT) 
		{
			var asiTRow = hearingDatesASIT[eachrow1st];
			if(asiTRow["Event Start Date"] != null && asiTRow["Event Start Date"] != "" && multFlag == ("No"))
			{
				var _eventDate = hearingDatesASIT[eachrow1st]['Event Start Date'].fieldValue
				var toDate = convertDate(_eventDate);
				//var eventStartDate = asiTRow["Event Dates"]
				//var veventDate = convertDate(eventStartDate);
				var today = aa.date.getCurrentDate();
				var vtoday = dateFormatted(today.getMonth(), today.getDayOfMonth(), today.getYear()); //this date is working to pull in today
				var numDaysDiff = dateDiff(vtoday,toDate)
				if ((numDaysDiff <= 14) && (numDaysDiff > 0)){
					var invFee = "Y";
					updateFee("TEMELATE01", "EH_FP_APP", "FINAL", 1, invFee);
				}
			}
			var asiTRow = hearingDatesASIT[eachrow1st];
			if(asiTRow["Event Start Date"] != null && asiTRow["Event Start Date"] != "" && multFlag == ("Yes") && numberOfEvents > 1)
			{
				var _eventDate = hearingDatesASIT[eachrow1st]['Event Start Date'].fieldValue
				var toDate = convertDate(_eventDate);
				//var eventStartDate = asiTRow["Event Dates"]
				//var veventDate = convertDate(eventStartDate);
				var today = aa.date.getCurrentDate();
				var vtoday = dateFormatted(today.getMonth(), today.getDayOfMonth(), today.getYear()); //this date is working to pull in today
				var numDaysDiff = dateDiff(vtoday,toDate)
				if ((numDaysDiff <= 21) && (numDaysDiff > 0)){
					var invFee = "Y";
					updateFee("TEMELATE01", "EH_FP_APP", "FINAL", 1, invFee);
				}
			}
		}
	}
}

function convertDate(thisDate) {
	//converts date to javascript date
	if (typeof thisDate == "string") {
		var retVal = new Date(String(thisDate));
		if (!retVal.toString().equals("Invalid Date")) return retVal;
	}
	if (typeof thisDate == "object") {
		if (!thisDate.getClass) {
			// object without getClass, assume that this is a javascript date already
			return thisDate;
		}
		if (thisDate.getClass().toString().equals("class com.accela.aa.emse.dom.ScriptDateTime")) {
			return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
		}
		if (thisDate.getClass().toString().equals("class java.util.Date")) {
			return new Date(thisDate.getTime());
		}
		if (thisDate.getClass().toString().equals("class java.lang.String")) {
			return new Date(String(thisDate));
		}
	}
	if (typeof thisDate == "number") {
		return new Date(thisDate); // assume milliseconds
	}
	logDebug("**WARNING** convertDate cannot parse date : " + thisDate);
	return null;
}

	function jsDateToMMDDYYYY(pJavaScriptDate) {
	//converts javascript date to string in MM/DD/YYYY format
	if (pJavaScriptDate != null) {
		if (Date.prototype.isPrototypeOf(pJavaScriptDate)) {
			return (pJavaScriptDate.getMonth() + 1).toString() + "/" + pJavaScriptDate.getDate() + "/" + pJavaScriptDate.getFullYear();
		} else {
			logDebug("Parameter is not a javascript date");
			return "INVALID JAVASCRIPT DATE";
		}
	} else {
		logDebug("Parameter is null");
		return "NULL PARAMETER VALUE";
	}
}

//Relate EnvHealth Records as children to entered Facility Record
if (appMatch("EnvHealth/*/*/*")) {
	var capIdPar = aa.cap.getCapID(getAppSpecific("Facility ID"));
	logDebug(capIdPar);
	if(capIdPar.getSuccess())
	{
		var parentId = capIdPar.getOutput();
		var linkResult = aa.cap.createAppHierarchy(parentId, capId);
	}
	//var cap = aa.env.getValue("CapModel");
	//var parentId = cap.getParentCapID();
}

function dateDiff(date1, date2) {

    return (convertDate(date2).getTime() - convertDate(date1).getTime()) / (1000 * 60 * 60 * 24);
}

/*
updateShortNotes((AInfo['Project Record ID']), capId);


function updateShortNotes(newSN) // option CapId
	{
	var itemCap = capId
	if (arguments.length > 1) itemCap = arguments[1]; // use cap ID specified in args

	var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!cdScriptObjResult.getSuccess())
		{ logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()) ; return false; }

	var cdScriptObj = cdScriptObjResult.getOutput();

	if (!cdScriptObj)
		{ logDebug("**ERROR: No cap detail script object") ; return false; }

	cd = cdScriptObj.getCapDetailModel();

	cd.setShortNotes(newSN);

	cdWrite = aa.cap.editCapDetail(cd)

	if (cdWrite.getSuccess())
		{ logDebug("updated short notes to " + newSN) }
	else
		{ logDebug("**ERROR writing capdetail : " + cdWrite.getErrorMessage()) ; return false ; }
	}
*/
