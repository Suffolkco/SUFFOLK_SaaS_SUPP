//specific to suffolkco, update appName with ASI:facility name value on any given record in the module
editAppName(AInfo["Facility Name"]);


/*
// Find Parent Facility and update current record with Facility Name and ID
if(!appMatch("EnvHealth/Facility/NA/NA")){
    var facilityID = getFacilityId(capId);
    if(facilityID != false){
        updateFacilityInfo(capId,facilityID);
    }
	editAppName(AInfo["Facility Name"]);
}
*/

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


// push program elements up to record detail tab

// Get "Program Element" and set "Short Notes" and "Detailed Description"
	// Check if "Program Element" custom field exists and has a value
if (AInfo["Program Element"] !== undefined && AInfo["Program Element"] !== null && AInfo["Program Element"].trim() !== "") {
	// Get "Program Element" and set "Short Notes" and "Detailed Description"
	updateWorkDesc(AInfo["Program Element"]);
	updateShortNotes(AInfo["Program Element"]);
}

// PHP-47 Script to Update Record Details of Related Records
/* On FA Record: 
Copy changes to Permit Record?  any status other than Deactivated, “Inactive, non-billable”, and “Temp inactive, non-billable”.
Copy changes to Application Record? (Child Application Record of ACTIVE Permit Record only)
(maybe an option for both if this is a dropdown?)
*/
if (appMatch("EnvHealth/Facility/NA/NA"))
{
    var copyfromFacToPermit = getAppSpecific("Copy changes to Permit Record?");
    var copyfromFacToApp = getAppSpecific("Copy changes to Application Record?");

    var childFoodPermitArray = getChildren("EnvHealth/Health Program/Food Protection/Permit", capId);
    var childMoiblePermitArray = getChildren("EnvHealth/Health Program/Mobile/Permit", capId);    
  
    logDebug("Fac copyfromFacToPermit: " + facProgramElem);
    logDebug("Fac copyfromFacToApp: " + copyfromFacToApp);

    if (copyfromFacToPermit == "Yes" || copyfromFacToApp == "Yes")
    {
        // Food Permit
        copyFromFacToFoodPermitCustomFields(childFoodPermitArray, copyfromFacToPermit, copyfromFacToApp);
        // Mobile Permit
        copyFromFacToMobilePermitCustomFields(childMoiblePermitArray, copyfromFacToPermit, copyfromFacToApp);
    }
   
}  
/*
On FSP/LMP Record:
Copy changes to Facility Record?
Copy changes to Application Record? (Child Application Record of this Permit Record)
(maybe an option for both if this is a dropdown?)
*/
else if (appMatch("EnvHealth/Health Program/Food Protection/Permit") || appMatch("EnvHealth/Health Program/Mobile/Permit"))
{   
    var childAppArray;
    var copyfromPe
    var copyfromPermitToFac = getAppSpecific("Copy changes to Facility Record?");  
    var copyfromPermitToApp = getAppSpecific("Copy changes to Application Record?");

    // Copy from permit to parent facility
    if (copyfromPermitToFac == "Yes")
    {      
        copyToFacCustomFields();
    }
    // Copy from permit to Child Application
    if (copyfromPermitToApp == "Yes")
    {         
        if (appMatch("EnvHealth/Health Program/Food Protection/Permit"))
        {    
            childAppArray = getChildren("EnvHealth/Health Program/Food Protection/Application", capId);       
        }
        else if (appMatch("EnvHealth/Health Program/Mobile/Permit"))
        {
            childAppArray = getChildren("EnvHealth/Health Program/Mobile/Application", capId);    
        }
       
        copyFromPermitToAppCustomFields(childAppArray);      
    }
} 
/* On FSA/LMA Record:
Copy changes to Permit Record? (Parent Permit Record of this application only)
Copy changes to Facility Record?
(maybe an option for both if this is a dropdown?) */
else if (appMatch("EnvHealth/Health Program/Food Protection/Application") || appMatch("EnvHealth/Health Program/Mobile/Application"))
{
    var copyfromAppToPermit = getAppSpecific("Copy changes to Permit Record?");
    var copyfromAppToFac = getAppSpecific("Copy changes to Facility Record?");

    if (copyfromAppToPermit == "Yes") 
    {
        // Copy changes to parent permit record of this application only
        parentId = getParent(capId);      
        var itemCapType = aa.cap.getCap(parentId).getOutput().getCapType().toString();
        if(matches(itemCapType, "EnvHealth/Health Program/Food Protection/Permit"))
        {
            setFoodServiceCustomFields(parentId);
            setCommonCustomFields(parentId);
        }
        else if (matches(itemCapType,"EnvHealth/Health Program/Mobile/Permit"))
        {
            setMobileCustomFields(parentId);
            setMobileAppPermitCustomFields(parentId);
            setCommonCustomFields(parentId);
        }
    }
    if (copyfromAppToFac == "Yes")
    {
        copyToFacCustomFields();
    }
}


function copyFromFacToFoodPermitCustomFields(childArray, copyfromFacToPermit, copyfromFacToApp)
{
    if (copyfromFacToPermit == "Yes" || copyfromFacToApp == "Yes")
    {
        if (childArray)
        {
            if (childArray.length > 0)
            {
                for (yy in childArray)
                {
                    childPermitCapId = childArray[yy];
                    var childPermitCapStatus = getAppStatus(childPermitCapId);
                    
                    logDebug("Food Permit childPermitCapStatus: " + childPermitCapStatus + ", " + childPermitCapId.getCustomID());

                    if (childPermitCapStatus != "Deactivated" && childPermitCapStatus != "Inactive, non-billable"
                    && childPermitCapStatus != "Temp inactive, non-billable" )
                    {
                        var facSeptic = getAppSpecific("Septic/Sewage");
                        var facSanArea= getAppSpecific("Sanitarian Area");
                        var facNoOfSeats = getAppSpecific("Number of Seats");                   
                        var facSeatsProvided = getAppSpecific("Seats Provided");                   
                        var facBarSeats = getAppSpecific("Bar Seats");
                        var facCatSeats = getAppSpecific("Catering Seats");
                        var facExtSeats = getAppSpecific("Exterior Seats");
                        var facResSeats = getAppSpecific("Restaurant Seats");
                        var facTotSeats= getAppSpecific("Total Seats");
                                       
                        logDebug("Permit facSeptic: " + facSeptic);
                        logDebug("Permit facSanArea: " + facSanArea);
                        logDebug("Permit facNoOfSeats: " + facNoOfSeats);
                        logDebug("Permit facTypeOfEst: " + facTypeOfEst);
                        logDebug("Permit facSeatsProvided: " + facSeatsProvided);                       
                        logDebug("Permit facBarSeats: " + facBarSeats);
                        logDebug("Permit facCatSeats: " + facCatSeats);
                        logDebug("Permit facExtSeats: " + facExtSeats);
                        logDebug("Permit facResSeats: " + facResSeats);
                        logDebug("Permit facTotSeats: " + facTotSeats);

                        // Only the flag is on, copy the Fac custom field values to Permit
                        if (copyfromFacToPermit == "Yes")
                        {                           
                            setFacFSAFSACustomFields(childPermitCapId);
                                                       
                            editAppSpecific("SAN AREA", facSanArea, childPermitCapId);                                         
                            editAppSpecific("UDF_BAR_SEATS", facBarSeats, childPermitCapId);
                            editAppSpecific("UDF_CATERING_SEATS", facCatSeats, childPermitCapId);
                            editAppSpecific("UDF_EXTERIOR_SEATS", facExtSeats, childPermitCapId);
                            editAppSpecific("UDF_RESTAURANT_SEATS", facResSeats,childPermitCapId);
                            editAppSpecific("UDF_WWM_MAX", facTotSeats, childPermitCapId);
                        }
                            
                        // Copy Facility custom field to Child Food Protection Application if the flag is ON
                        if (copyfromFacToApp == "Yes") 
                        {                        
                            var childFoodAppArray = getChildren("EnvHealth/Health Program/Food Protection/Application", childPermitCapId);
                            if (childFoodAppArray.length > 0)
                            {
                                for (yy in childFoodAppArray)
                                {
                                    childFoodAppCapId = childFoodAppArray[yy];
                                    var childFoodAppCapStatus = getAppStatus(childFoodAppCapId);
                                    
                                    logDebug("App childFoodAppCapStatus: " + childFoodAppCapStatus + ", " + childFoodAppCapId.getCustomID());
                                                                        
                                    setFacFSAFSACustomFields(childFoodAppCapId);    
                                }
                            }

                        }
                    }                    
                }
            }
        }
    }
}

function copyFromFacToMobilePermitCustomFields(childArray , copyfromFacToPermit, copyfromFacToApp)
{    
    if (copyfromFacToPermit == "Yes" || copyfromFacToApp == "Yes")
    {
        if (childArray)
        {
            if (childArray.length > 0)
            {
                for (yy in childArray)
                {
                    childPermitCapId = childArray[yy];
                    var childPermitCapStatus = getAppStatus(childPermitCapId);
                    
                    logDebug("Permit childPermitCapStatus: " + childPermitCapStatus + ", " + childPermitCapId.getCustomID());

                    if (childPermitCapStatus != "Deactivated" && childPermitCapStatus != "Inactive, non-billable"
                    && childPermitCapStatus != "Temp inactive, non-billable" )
                    {                             
                        var facSanArea= getAppSpecific("Sanitarian Area");                                         
                     
                        if (copyfromFacToPermit == "Yes") 
                        {
                            // Facilty DBA name, Type of Ownership, Water Supply, Type of Est, Program Element
                            setCommonCustomFields(childePermitCapId);                         
                            editAppSpecific("SAN AREA", facSanArea, childPermitCapId);                           
                             // Lic Plate Number, Lic Plate State, Veh Make, Veh Model, Veh year
                             setMobileCustomFields(childPermitCapId);
                        }
                        if (copyfromFacToApp == "Yes") 
                        {
                            // Copy only if it is Child Application Record of ACTIVE Permit Record
                            var childMobileAppArray = getChildren("EnvHealth/Health Program/Mobile/Application", childPermitCapId);    
                            
                            if (childMobileAppArray.length > 0)
                            {
                                for (yy in childMobileAppArray)
                                {
                                    childMobileAppCapId = childMobileAppArray[yy];
                                    var childMobileAppCapStatus = getAppStatus(childMobileAppCapId);
                                    
                                    logDebug("App childMobileAppCapStatus: " + childMobileAppCapStatus + ", " + childMobileAppCapId.getCustomID());                                 
                                                     
                                    // Facilty DBA name, Type of Ownership, Water Supply, Type of Est, Program Element
                                    setCommonCustomFields(childMobileAppCapId);
                                    // Lic Plate Number, Lic Plate State, Veh Make, Veh Model, Veh year
                                    setMobileCustomFields(childMobileAppCapId);

                                }
                            }

                        }
                    }                    
                }
            }
        }
    }
    
}

function copyFromPermitToAppCustomFields(childAppArray)
{    
    if (childAppArray)
    {
        if (childAppArray.length > 0)
        {
            for (yy in childAppArray)
            {
                childAppCapId = childAppArray[yy];

                // If the current cap is FSP, set the child FSA custom fields
                if (appMatch("EnvHealth/Health Program/Food Protection/Permit"))
                {
                    // Get FSP custom fields and copy to FSA     
                    setFoodServiceCustomFields(childAppCapId);

                } // If the current cap is LMP, set the child LMA custom fields
                else if (appMatch("EnvHealth/Health Program/Mobile/Permit"))
                {                    
                    // Lic Plate Number, Lic Plate State, Veh Make, Veh Model, Veh year
                    setMobileCustomFields(childAppCapId);      
                    setMobileAppPermitCustomFields(childAppCapId)                  

                }                
              
                // Below applies to both FSA and LMA
                // Facilty DBA name, Type of Ownership, Water Supply, Type of Est, Program Element
                 setCommonCustomFields(childAppCapId);      
         
            }
        }
    }

}

function setMobileAppPermitCustomFields(recordCapId)
{  
    var toiletFac = getAppSpecific("Where are toilet facilities located?");
    var desVendingLoc = getAppSpecific("Do you have a designated vending location?");
    var addLine1 = getAppSpecific("Address Line 1 (Vending Location)");                
    
    var addLine2 = getAppSpecific("Address Line 2 (Vending Location)");                        
    var city = getAppSpecific("City (Vending Location)");
    var state = getAppSpecific("State (Vending Location)");
    var zip = getAppSpecific("Zip Code (Vending Location)");
    var vesselSeats= getAppSpecific("Number of Dinner Cruise Vessel Seats");
    
    editAppSpecific("Where are toilet facilities located?", toiletFac, recordCapId);
    editAppSpecific("Do you have a designated vending location?", desVendingLoc, recordCapId);    
    editAppSpecific("Address Line 1 (Vending Location)", addLine1, recordCapId);
    editAppSpecific("Address Line 2 (Vending Location)", addLine2, recordCapId);
    editAppSpecific("City (Vending Location)", city, recordCapId);
    editAppSpecific("State (Vending Location)", state, recordCapId);
    editAppSpecific("Zip Code (Vending Location)", zip, recordCapId);
    editAppSpecific("Number of Dinner Cruise Vessel Seats", vesselSeats, recordCapId);  
}

// These are the common custom fields for All FAC, FSA, FSP, LMA and LMP
function setCommonCustomFields(recordCapId)
{
    var facDBAName = getAppSpecific("Facility Name");
    var facTypeOfOwn = getAppSpecific("Type of Ownership");
    var facWaterSupply = getAppSpecific("Water Supply");                
      
    var facTypeOfEst = getAppSpecific("Type of Establishment");                        
    var facProgramElem= getAppSpecific("Program Element");
        
    editAppSpecific("Facility Name", facDBAName, recordCapId);
    editAppSpecific("Type of Ownership", facTypeOfOwn, recordCapId);    
    editAppSpecific("Water Supply", facWaterSupply, recordCapId);
    editAppSpecific("Type of Establishment", facTypeOfEst, recordCapId);
    editAppSpecific("Program Element", facProgramElem, recordCapId);
    
    logDebug("Setting Facility DBA Name of " + recordCapId + " to be: " + facDBAName);
    logDebug("Setting Type of Ownership of " + recordCapId + " to be: " + facTypeOfOwn);
    logDebug("Setting Water Supply of " + recordCapId + " to be: " + facWaterSupply);
    logDebug("Setting Type of Establishment of " + recordCapId + " to be: " + facTypeOfEst);
    logDebug("Setting Program Element of " + recordCapId + " to be: " + facProgramElem);
}

// These are the common custom fields for FSA and FSP
function setFoodServiceCustomFields(recordCapId)
{
    var permitSeatsProvided = getAppSpecific("Seats Provided");      
    var permitNoOfSeats = getAppSpecific("Number of Seats");  
    var permitSeptic = getAppSpecific("Septic/Sewage");                  
                  
    var permitMonday = getAppSpecific("Monday");
    var permitTuesday = getAppSpecific("Tuesday");
    var permitWednesday = getAppSpecific("Wednesday");
    var permitThursdsay = getAppSpecific("Thursdsay");
    var permitFriday = getAppSpecific("Friday");
    var permitSaturday = getAppSpecific("Saturday");
    var permitSunday = getAppSpecific("Sunday");
    var permitFrom = getAppSpecific("From");
    var permitTo = getAppSpecific("To");   

       
    editAppSpecific("Septic/Sewage", permitSeptic, recordCapId);
    editAppSpecific("Number of Seats", permitNoOfSeats,recordCapId);
    editAppSpecific("Seats Provided", permitSeatsProvided, recordCapId);

    editAppSpecific("Monday", permitMonday, recordCapId);
    editAppSpecific("Tuesday", permitTuesday,recordCapId);
    editAppSpecific("Wednesday", permitWednesday, recordCapId);
    editAppSpecific("Thursdsay", permitThursdsay, recordCapId);
    editAppSpecific("Friday", permitFriday,recordCapId);
    editAppSpecific("Saturday", permitSaturday, recordCapId);
    editAppSpecific("Sunday", permitSunday, recordCapId);
    editAppSpecific("From", permitFrom,recordCapId);
    editAppSpecific("To", permitTo, recordCapId);   

    logDebug("Setting Septic/Sewage of " + recordCapId + " to be: " + permitSeptic);
    logDebug("Setting Number of Seats of " + recordCapId + " to be: " + permitNoOfSeats);
    logDebug("Setting Seats Provided of " + recordCapId + " to be: " + permitSeatsProvided);
    logDebug("Setting Monday of " + recordCapId + " to be: " + permitMonday);
    logDebug("Setting Tuesday of " + recordCapId + " to be: " + permitTuesday);
    logDebug("Setting Wednesday of " + recordCapId + " to be: " + permitWednesday);
    logDebug("Setting Thursdsay of " + recordCapId + " to be: " + permitThursdsay);
    logDebug("Setting Friday of " + recordCapId + " to be: " + permitFriday);
    logDebug("Setting Saturday of " + recordCapId + " to be: " + permitSaturday);
    logDebug("Setting Sunday of " + recordCapId + " to be: " + permitSunday);
    logDebug("Setting From of " + recordCapId + " to be: " + permitFrom);
    logDebug("Setting To of " + recordCapId + " to be: " + permitTo);

}

// These are the common custom fields for FAC, FSA and FSP
function setFacFSAFSACustomFields(recordCapId)
{
    var dBAName = getAppSpecific("Facility Name");
    var typeOfOwn = getAppSpecific("Type of Ownership");
    var waterSupply = getAppSpecific("Water Supply");                
    var septicSewage = getAppSpecific("Septic/Sewage");     
    var typeOfEst = getAppSpecific("Type of Establishment");      
    var noOfSeats = getAppSpecific("Number of Seats");       
    var seatProvided= getAppSpecific("Seat Provided");            
    var programElem= getAppSpecific("Program Element");
        
    editAppSpecific("Facility Name", dBAName, recordCapId);
    editAppSpecific("Type of Ownership", typeOfOwn, recordCapId);    
    editAppSpecific("Water Supply", waterSupply, recordCapId);
    editAppSpecific("Septic/Sewage", septicSewage, recordCapId);
    editAppSpecific("Type of Establishment", typeOfEst, recordCapId);
    editAppSpecific("Number Of Seats", noOfSeats, recordCapId);
    editAppSpecific("Seat Provided", seatProvided, recordCapId);
    editAppSpecific("Program Element", programElem, recordCapId);

    logDebug("Setting Facility DBA Name of " + recordCapId + " to be: " + dBAName);
    logDebug("Setting Type of Ownership of " + recordCapId + " to be: " + typeOfOwn);
    logDebug("Setting Water Supply of " + recordCapId + " to be: " + waterSupply);
    logDebug("Setting Septic/Sewage of " + recordCapId + " to be: " + septicSewage);
    logDebug("Setting Type of Establishment of " + recordCapId + " to be: " + typeOfEst);
    logDebug("Setting Number Of Seats of " + recordCapId + " to be: " + noOfSeats);
    logDebug("Setting Seat Provided of " + recordCapId + " to be: " + seatProvided);
    logDebug("Setting Program Element of " + recordCapId + " to be: " + programElem);  
}

function setMobileCustomFields(recordCapId)
{
    var permitLicPlateNumber= getAppSpecific("License Plate Number");
    var permitLicPlateState = getAppSpecific("License Plate State");
    var permitVehMake = getAppSpecific("Vehicle Make");
    var permitVehModel = getAppSpecific("Vehicle Model");
    var permitVehYear = getAppSpecific("Vehicle year");     

    editAppSpecific("License Plate Number", permitLicPlateNumber, recordCapId);                                  
    editAppSpecific("License Plate State", permitLicPlateState, recordCapId);
    editAppSpecific("Vehicle Make", permitVehMake, recordCapId);
    editAppSpecific("Vehicle Model", permitVehModel,recordCapId);
    editAppSpecific("Vehicle Year", permitVehYear, recordCapId);     

    logDebug("Setting License Plate Number of " + recordCapId + " to be: " + permitLicPlateNumber);
    logDebug("Setting License Plate State of " + recordCapId + " to be: " + permitLicPlateState);
    logDebug("Setting Vehicle Make of " + recordCapId + " to be: " + permitVehMake);
    logDebug("Setting Vehicle Model of " + recordCapId + " to be: " + permitVehModel);
    logDebug("Setting Vehicle Year of " + recordCapId + " to be: " + permitVehYear);

   
}


function copyToFacCustomFields()
{    
    var parents = getParents("EnvHealth/Facility/NA/NA");
        
    for (var parent in parents)
    {
        var parentCapId = parents[parent];
        
        logDebug("Setting Fac custom fields: " + parentCapId.getCustomID());

        // FSA
        if (appMatch("EnvHealth/Health Program/Food Protection/Application"))
        {
            var permitSeatsProvided = getAppSpecific("Seats Provided");
            var permitSeptic = getAppSpecific("Septic/Sewage");
            var permitNoOfSeats = getAppSpecific("Number of Seats");    
        
            editAppSpecific("Seats Provided", permitSeatsProvided, parentCapId);
            editAppSpecific("Septic/Sewage", permitSeptic, parentCapId);
            editAppSpecific("Number of Seats", permitNoOfSeats,parentCapId);    
            // Facilty DBA name, Type of Ownership, Water Supply, Type of Est, Program Element
            setCommonCustomFields(parentCapId);          
             
        } 
        // FSP
        else if (appMatch("EnvHealth/Health Program/Food Protection/Permit"))
        {
            var permitSeatsProvided = getAppSpecific("Seats Provided");
            var permitSeptic = getAppSpecific("Septic/Sewage");
            var permitNoOfSeats = getAppSpecific("Number of Seats");    
            var permitBarSeats = getAppSpecific("UDF_BAR_SEATS");
            var permitCatSeats = getAppSpecific("UDF_CATERING_SEATS");
            var permitExtSeats = getAppSpecific("UDF_EXTERIOR_SEATS");
            var permitResSeats = getAppSpecific("UDF_RESTAURANT_SEATS");
            var permitTotSeats= getAppSpecific("UDF_WWM_MAX");
            var permitSanArea = getAppSpecific("SAN AREA");

            editAppSpecific("Seats Provided", permitSeatsProvided, parentCapId);
            editAppSpecific("Septic/Sewage", permitSeptic, parentCapId);
            editAppSpecific("Number of Seats", permitNoOfSeats,parentCapId);
            editAppSpecific("Bar Seats", permitBarSeats, parentCapId);
            editAppSpecific("Catering Seats", permitCatSeats, parentCapId);
            editAppSpecific("Exterior Seats", permitExtSeats,parentCapId);
            editAppSpecific("Total Seats", permitTotSeats, parentCapId);
            editAppSpecific("Restaurant Seats", permitResSeats, parentCapId);
            editAppSpecific("Sanitarian Area", permitSanArea, parentCapId);
             // Facilty DBA name, Type of Ownership, Water Supply, Type of Est, Program Element
             setCommonCustomFields(parentCapId);          

        }         // LMA
        else if (appMatch("EnvHealth/Health Program/Mobile/Application"))
        {
            // Lic Plate Number, Lic Plate State, Veh Make, Veh Model, Veh year
            setMobileCustomFields(parentCapId);                       
            // Facilty DBA name, Type of Ownership, Water Supply, Type of Est, Program Element
            setCommonCustomFields(parentCapId);          
        } 
        // LMP
        else if (appMatch("EnvHealth/Health Program/Mobile/Permit"))
        {          
            // Lic Plate Number, Lic Plate State, Veh Make, Veh Model, Veh year
            setMobileCustomFields(parentCapId);     
            var permitSanArea = getAppSpecific("SAN AREA");
            editAppSpecific("Sanitarian Area", permitSanArea, parentCapId);
             // Below apply for both FSP and LMP
            // Facilty DBA name, Type of Ownership, Water Supply, Type of Est, Program Element
            setCommonCustomFields(parentCapId);          
        }

       
      
    }    

}


//helper functions
function editRecordStatus(targetCapId, strStatus){
    var capModel = aa.cap.getCap(targetCapId).getOutput();
    capModel.setCapStatus(strStatus);
    aa.cap.editCapByPK(capModel.getCapModel());
  }
  function copyASIBySubGroup(sourceCapId, targetCapId, vSubGroupName) {
    useAppSpecificGroupName = true;
    var sAInfo = new Array;
    loadAppSpecific(sAInfo, sourceCapId);
    for (var asi in sAInfo) {
      if( asi.substr(0,asi.indexOf(".")) == vSubGroupName){
        editAppSpecific(asi, sAInfo[asi], targetCapId);
      }
    }
    useAppSpecificGroupName = false;
  }
  function getAppName(capId){    
    capResult = aa.cap.getCap(capId);
    capModel = capResult.getOutput().getCapModel()
    var appName = capModel.getSpecialText();
    if(appName){
      return appName;
    }else{
          return false;
    }
  }
  function updateFacilityInfo(targetCapId,vFacilityId){
      var capResult = aa.cap.getCap(vFacilityId);
      if(capResult != null){
          var capModel = capResult.getOutput().getCapModel()
          var appName = capModel.getSpecialText();
          var itemName = "Facility ID";
          var itemGroup = null;
          if (useAppSpecificGroupName){
              if (itemName.indexOf(".") < 0)
                  { logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
              itemGroup = itemName.substr(0,itemName.indexOf("."));
              itemName = itemName.substr(itemName.indexOf(".")+1);
          }
          var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(targetCapId,itemName,vFacilityId.getCustomID(),itemGroup);
          if (appSpecInfoResult.getSuccess()){
              logDebug( "INFO: " + itemName + " was updated."); 
          } 	
          else{
              logDebug( "WARNING: " + itemName + " was not updated."); 
          }
          var itemName = "Facility Name";
          var itemGroup = null;
          if (useAppSpecificGroupName){
              if (itemName.indexOf(".") < 0)
                  { logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
              itemGroup = itemName.substr(0,itemName.indexOf("."));
              itemName = itemName.substr(itemName.indexOf(".")+1);
          }
          var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(targetCapId,itemName,appName,itemGroup);
          if (appSpecInfoResult.getSuccess()){
              logDebug( "INFO: " + itemName + " was updated."); 
          } 	
          else{
              logDebug( "WARNING: " + itemName + " was not updated."); 
          }
          var itemName = "Facility DBA";
          var itemGroup = null;
          if (useAppSpecificGroupName){
              if (itemName.indexOf(".") < 0)
                  { logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
              itemGroup = itemName.substr(0,itemName.indexOf("."));
              itemName = itemName.substr(itemName.indexOf(".")+1);
          }
          var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(targetCapId,itemName,getAppSpecific("Facility DBA",vFacilityId),itemGroup);
          if (appSpecInfoResult.getSuccess()){
              logDebug( "INFO: " + itemName + " was updated."); 
          } 	
          else{
              logDebug( "WARNING: " + itemName + " was not updated."); 
          }
          var itemName = "Business Code";
          var itemGroup = null;
          if (useAppSpecificGroupName){
              if (itemName.indexOf(".") < 0)
                  { logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
              itemGroup = itemName.substr(0,itemName.indexOf("."));
              itemName = itemName.substr(itemName.indexOf(".")+1);
          }
          var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(targetCapId,itemName,getAppSpecific("Business Code",vFacilityId),itemGroup);
          if (appSpecInfoResult.getSuccess()){
              logDebug( "INFO: " + itemName + " was updated."); 
          } 	
          else{
              logDebug( "WARNING: " + itemName + " was not updated."); 
          }
          var itemName = "Billing Anniversary";
          var itemGroup = null;
          if (useAppSpecificGroupName){
              if (itemName.indexOf(".") < 0)
                  { logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
              itemGroup = itemName.substr(0,itemName.indexOf("."));
              itemName = itemName.substr(itemName.indexOf(".")+1);
          }
          var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(targetCapId,itemName,getAppSpecific("Billing Anniversary",vFacilityId),itemGroup);
          if (appSpecInfoResult.getSuccess()){
              logDebug( "INFO: " + itemName + " was updated."); 
          } 	
          else{
              logDebug( "WARNING: " + itemName + " was not updated."); 
          }
      }
  }
  //Import these into the INCLUDES_CUSTOM
function addBStructure(vCapId,structNo,structType,structName,structDesc){
    var added = aa.bStructure.addStructure(vCapId, structNo, structType, structName, structDesc, "", aa.date.getCurrentDate());
    if (added.getSuccess()) {
        logDebug("BStructure Added Successfully");
        return true;
    } else {
        logDebug("BStructure Added ERROR: " + added.getErrorMessage());
        return false;
    }
}
function updateBStructure(vCapId,structNo,structType,structName,structDesc){
    var updated = aa.bStructure.updateStructure(vCapId, structNo, structType, structName, structDesc, "", aa.date.getCurrentDate());
    if (updated.getSuccess()) {
        logDebug("BStructure Updated Successfully");
        return true;
    } else {
        logDebug("BStructure Updated ERROR: " + updated.getErrorMessage());
        return false;
    }
}
function updateGuidesheetFieldValueByArrayMultiPermtAct(updateArr) {
	for (var Permit in updateArr){
		var ArrayCapId = updateArr[Permit][4];
		var r = aa.inspection.getInspections(ArrayCapId);
		if (r.getSuccess()) {
			var inspArray = r.getOutput();
			for (i in inspArray) {
				var inspModel = inspArray[i].getInspection();
				var gs = inspModel.getGuideSheets();
				if (gs) {
					gsArray = gs.toArray();
					for(gsIdx in gsArray){
						var guideSheetObj = gsArray[gsIdx];
						var guidesheetItem = guideSheetObj.getItems();
						for(var j=0;j< guidesheetItem.size();j++) {
							var item = guidesheetItem.get(j);
							for (var gItem in updateArr){
								var ArraySeqNo = updateArr[gItem][0];
								var ArrayRowViolName = updateArr[gItem][1];
								var ArrayASIName1 = updateArr[gItem][2];
								var ArrayASIValue1 = updateArr[gItem][3];
								var ArrayCapId = updateArr[gItem][4];
								if(parseInt(ArraySeqNo) == item.guideItemSeqNbr){
									//1. Filter Guide Sheet items by Guide sheet item name && ASI group code
									if(item.getGuideItemText() == ArrayRowViolName) {
										var ASISubGroups = item.getItemASISubgroupList();
										if(ASISubGroups) {
											//2. Filter ASI sub group by ASI Sub Group name
											for(var k=0;k< ASISubGroups.size();k++) {
												var ASISubGroup = ASISubGroups.get(k);
                                    var ASIModels =  ASISubGroup.getAsiList();
                                    if(ASIModels) {
                                          //3. Filter ASI by ASI name
                                          for( var m = 0; m< ASIModels.size();m++) {
                                             var ASIModel = ASIModels.get(m);
                                             if(ASIModel && ASIModel.getAsiName() == ArrayASIName1) {
                                                logDebug(ArrayRowViolName + " Change ASI value " + ASIModel.getAsiName() + " from:"+ ASIModel.getAttributeValue() +" to " + ArrayASIValue1);
                                                //4. Reset ASI value
                                                ASIModel.setAttributeValue(ArrayASIValue1);
                                             }
                                          }
                                    }
											}
										}
									}
								}
							}
						}				
						//Update the guidesheet
						var updateResult = aa.guidesheet.updateGGuidesheet(guideSheetObj,guideSheetObj.getAuditID());
						if (updateResult.getSuccess()) {
							logDebug("Successfully updated GS Data on inspection " + inspArray[i].getIdNumber() + ".");
						} else {
							logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
							return false;
						}
					}
				} else {
					// if there are guidesheets
					logDebug("No guidesheets for this inspection");
					return false;
				}
			}
		} else {
			logDebug("No inspections on the record");
			return false;
		}
		logDebug("No updates to the guidesheet made");
		return false;
	}

}
function editSpecificASITableRow(tableCapId, tableName, keyName, keyValue, editName, editValue) {
	// keyName and keyValue is the column name and column value you want to use to filter for records you want to update
	// editName and editValue are the new values
   var tableArr = loadASITable(tableName, tableCapId);
   var tssmResult = aa.appSpecificTableScript.removeAppSpecificTableInfos(tableName,tableCapId,"ADMIN");
   if (tableArr) {
      for (var r in tableArr) {
         if (tableArr[r][keyName] != keyValue) {
            var rowArr=new Array();
            var tempArr=new Array();
            for (var col in tableArr[r]) {
               var tVal = new asiTableValObj(tableArr[r][col].columnName, tableArr[r][col].fieldValue, tableArr[r][col].readOnly);
               var tVal = tableArr[r][col];
               //bizarre string conversion - just go with it
               var colName = new String(tableArr[r][col].columnName.toString());
               colName=colName.toString();
               tempArr[colName] = tVal;
            }
            rowArr.push(tempArr); 
            //for (var val in rowArr) for (var c in rowArr[val]) aa.print("Value " + c + ": " + rowArr[val][c]);
            addASITable(tableName,rowArr,tableCapId);
         }
         else {
            logDebug(" Editing row " + r);
            var rowArr=new Array();
            var tempArr=new Array();
            for (var col in tableArr[r]) {
               if (tableArr[r][col].columnName.toString() == editName) {
                  var tVal = tableArr[r][col];
                  tVal.fieldValue = editValue;
               }
               else {
                  var tVal = tableArr[r][col];
               }
               //bizarre string conversion - just go with it
               var colName = new String(tableArr[r][col].columnName.toString());
               colName=colName.toString();
               tempArr[colName] = tVal;
            }
            rowArr.push(tempArr); 
            //for (var val in rowArr) for (var c in rowArr[val]) aa.print("Value " + c + ": " + rowArr[val][c]);
            addASITable(tableName,rowArr,tableCapId);
         }
      }
   }//end loop
}
function editSpecificASITableRow2Column(tableCapId, tableName, keyName1, keyValue1,keyName2, keyValue2, editName, editValue) {
	// keyName and keyValue is the column name and column value you want to use to filter for records you want to update
	// editName and editValue are the new values
   var tableArr = loadASITable(tableName, tableCapId);
   var tssmResult = aa.appSpecificTableScript.removeAppSpecificTableInfos(tableName,tableCapId,"ADMIN");
   if (tableArr) {
      for (var r in tableArr) {
         if (tableArr[r][keyName1] == keyValue1 && tableArr[r][keyName2] == keyValue2) {
            logDebug(" Editing row " + r);
            var rowArr=new Array();
            var tempArr=new Array();
            for (var col in tableArr[r]) {
               if (tableArr[r][col].columnName.toString() == editName) {
                  var tVal = tableArr[r][col];
                  tVal.fieldValue = editValue;
               }
               else {
                  var tVal = tableArr[r][col];
               }
               //bizarre string conversion - just go with it
               var colName = new String(tableArr[r][col].columnName.toString());
               colName=colName.toString();
               tempArr[colName] = tVal;
            }
            rowArr.push(tempArr); 
            //for (var val in rowArr) for (var c in rowArr[val]) aa.print("Value " + c + ": " + rowArr[val][c]);
            addASITable(tableName,rowArr,tableCapId);
         }else{
            var rowArr=new Array();
            var tempArr=new Array();
            for (var col in tableArr[r]) {
               var tVal = new asiTableValObj(tableArr[r][col].columnName, tableArr[r][col].fieldValue, tableArr[r][col].readOnly);
               var tVal = tableArr[r][col];
               //bizarre string conversion - just go with it
               var colName = new String(tableArr[r][col].columnName.toString());
               colName=colName.toString();
               tempArr[colName] = tVal;
            }
            rowArr.push(tempArr); 
            //for (var val in rowArr) for (var c in rowArr[val]) aa.print("Value " + c + ": " + rowArr[val][c]);
            addASITable(tableName,rowArr,tableCapId);
         }
      }
   }//end loop
}
function editSpecificASITableRowforInteger(tableCapId, tableName, keyName, keyValue, editName, editValue) {
	// keyName and keyValue is the column name and column value you want to use to filter for records you want to update
	// editName and editValue are the new values
   var tableArr = loadASITable(tableName, tableCapId);
   var tssmResult = aa.appSpecificTableScript.removeAppSpecificTableInfos(tableName,tableCapId,"ADMIN");
   if (tableArr) {
      for (var r in tableArr) {
         if (parseInt(tableArr[r][keyName]) != parseInt(keyValue)) {
            var rowArr=new Array();
            var tempArr=new Array();
            for (var col in tableArr[r]) {
               var tVal = new asiTableValObj(tableArr[r][col].columnName, tableArr[r][col].fieldValue, tableArr[r][col].readOnly);
               var tVal = tableArr[r][col];
               //bizarre string conversion - just go with it
               var colName = new String(tableArr[r][col].columnName.toString());
               colName=colName.toString();
               tempArr[colName] = tVal;
            }
            rowArr.push(tempArr); 
            //for (var val in rowArr) for (var c in rowArr[val]) aa.print("Value " + c + ": " + rowArr[val][c]);
            addASITable(tableName,rowArr,tableCapId);
         }
         else {
            logDebug(" Editing row " + r);
            var rowArr=new Array();
            var tempArr=new Array();
            for (var col in tableArr[r]) {
               if (tableArr[r][col].columnName.toString() == editName) {
                  var tVal = tableArr[r][col];
                  tVal.fieldValue = editValue;
               }
               else {
                  var tVal = tableArr[r][col];
               }
               //bizarre string conversion - just go with it
               var colName = new String(tableArr[r][col].columnName.toString());
               colName=colName.toString();
               tempArr[colName] = tVal;
            }
            rowArr.push(tempArr); 
            //for (var val in rowArr) for (var c in rowArr[val]) aa.print("Value " + c + ": " + rowArr[val][c]);
            addASITable(tableName,rowArr,tableCapId);
         }
      }
   }//end loop
}
function editSpecificASITableRowforInteger2Column(tableCapId, tableName, keyName1, keyValue1,keyName2, keyValue2, editName, editValue) {
	// keyName and keyValue is the column name and column value you want to use to filter for records you want to update
	// editName and editValue are the new values
   var tableArr = loadASITable(tableName, tableCapId);
   var tssmResult = aa.appSpecificTableScript.removeAppSpecificTableInfos(tableName,tableCapId,"ADMIN");
   if (tableArr) {
      for (var r in tableArr) {
        if (parseInt(tableArr[r][keyName1]) == parseInt(keyValue1) && parseInt(tableArr[r][keyName2]) == parseInt(keyValue2)) {
            var rowArr=new Array();
            var tempArr=new Array();
            for (var col in tableArr[r]) {
               if (tableArr[r][col].columnName.toString() == editName) {
                  logDebug(" Editing row " + r + " updating " + tableArr[r][col].columnName.toString() + " to " + editValue);
                  var tVal = tableArr[r][col];
                  tVal.fieldValue = editValue;
               }
               else {
                  var tVal = tableArr[r][col];
               }
               //bizarre string conversion - just go with it
               var colName = new String(tableArr[r][col].columnName.toString());
               colName=colName.toString();
               tempArr[colName] = tVal;
            }
            rowArr.push(tempArr); 
            //for (var val in rowArr) for (var c in rowArr[val]) aa.print("Value " + c + ": " + rowArr[val][c]);
            addASITable(tableName,rowArr,tableCapId);
         
         }else {
            var rowArr=new Array();
            var tempArr=new Array();
            for (var col in tableArr[r]) {
               var tVal = new asiTableValObj(tableArr[r][col].columnName, tableArr[r][col].fieldValue, tableArr[r][col].readOnly);
               var tVal = tableArr[r][col];
               //bizarre string conversion - just go with it
               var colName = new String(tableArr[r][col].columnName.toString());
               colName=colName.toString();
               tempArr[colName] = tVal;
            }
            rowArr.push(tempArr); 
            //for (var val in rowArr) for (var c in rowArr[val]) aa.print("Value " + c + ": " + rowArr[val][c]);
            addASITable(tableName,rowArr,tableCapId);
         }
      }
   }//end loop
}
function getActivityCustomFieldValue(capId,activityCustomFieldName,curActivityNumber){
	var activityBusiness = aa.proxyInvoker.newInstance("com.accela.aa.aamain.servicerequest.ActivityBusiness").getOutput();
	var ActivitySpecInfoBusiness = aa.proxyInvoker.newInstance("com.accela.aa.aamain.activityspecinfo.ActivitySpecInfoBusiness").getOutput();
	if(activityBusiness != null){
		var activityList = activityBusiness.getActivityListBySR(capId);
		if(!activityList) {
			logDebug("No activities on target record.");
			return false;
		}
		var lIt = activityList.iterator();
		while(lIt.hasNext()){
			var thisActivity = lIt.next();
			if(thisActivity.getActivityNumber() == parseInt(curActivityNumber)){
				var fieldsList = ActivitySpecInfoBusiness.getRefASIsByRefAcitivity(aa.getServiceProviderCode(),'RECORD',thisActivity.getActivityNumber());
				var fIt = fieldsList.iterator();
				while(fIt.hasNext()){
					var thisField = fIt.next();
					if(thisField.ASIName == activityCustomFieldName){
						return thisField.dispASIValue;
					}
				}
			}
		}
	}
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
function getGuideSheetFieldValue(gsCustomFieldItem,itemCap,inspIDNumArg,gsItemSeqNo) {
	var r = aa.inspection.getInspections(itemCap);
	if (r.getSuccess()) {
		var inspArray = r.getOutput();
		for (i in inspArray) {
			var inspModel = inspArray[i].getInspection();
			if(inspModel.getIdNumber() == inspIDNumArg){
				var gs = inspModel.getGuideSheets();
				if (gs) {
					for (var i = 0; i < gs.size(); i++) {
						var guideSheetObj = gs.get(i);
						var guidesheetItem = guideSheetObj.getItems();
						for (var j = 0; j < guidesheetItem.size(); j++) {
							var item = guidesheetItem.get(j);
							if(item.guideItemSeqNbr == parseInt(gsItemSeqNo)){
								if (item.getItemASISubgroupList() != null) {
									var subGroupList = item.getItemASISubgroupList();
									if (subGroupList != null) {
										for (var index = 0; index < subGroupList.size(); index++) {
											var subGroupItem = subGroupList.get(index);
											if (subGroupItem != null) {
												var asiList = subGroupItem.getAsiList();
												for (var asiIndex = 0; asiIndex < asiList.size(); asiIndex++) {
													var asiItem = asiList.get(asiIndex);
													if (asiItem.getAsiName() == gsCustomFieldItem) {
														if (asiItem.getAttributeValue() != null && asiItem.getAttributeValue() != "") {
															return asiItem.getAttributeValue();
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
	return "";

}
function updateGuidesheetFieldValueByArray(updateArr, vCapId) {
	var r = aa.inspection.getInspections(vCapId);
	if (r.getSuccess()) {
		var inspArray = r.getOutput();
		for (i in inspArray) {
            var vInspId = inspArray[i].getIdNumber();
            var inspModel = inspArray[i].getInspection();
            var gs = inspModel.getGuideSheets();
            if (gs) {
                gsArray = gs.toArray();
                for(gsIdx in gsArray){
                    var guideSheetObj = gsArray[gsIdx];
                    var guidesheetItem = guideSheetObj.getItems();
                    for(var j=0;j< guidesheetItem.size();j++) {
                        var item = guidesheetItem.get(j);
                        for (var gItem in updateArr){
                            var ArraySeqNo = updateArr[gItem][0];
                            var ArrayRowViolName = updateArr[gItem][1];
                            var ArrayASIName1 = updateArr[gItem][2];
                            var ArrayASIValue1 = updateArr[gItem][3];
                            var ArrayASIName2 = updateArr[gItem][4];
                            var ArrayASIValue2 = updateArr[gItem][5];
                            var ArrayASIName3 = updateArr[gItem][6];
                            var ArrayASIValue3 = updateArr[gItem][7];
                            var ArrayCapId = updateArr[gItem][8];
                            var ArrayInspd = updateArr[gItem][9];
                            if(parseInt(ArraySeqNo) == item.guideItemSeqNbr && parseInt(ArrayInspd) == vInspId){
								//1. Filter Guide Sheet items by Guide sheet item name && ASI group code
								if(item.getGuideItemText() == ArrayRowViolName) {
									var ASISubGroups = item.getItemASISubgroupList();
									if(ASISubGroups) {
										//2. Filter ASI sub group by ASI Sub Group name
										for(var k=0;k< ASISubGroups.size();k++) {
											var ASISubGroup = ASISubGroups.get(k);
                                            var ASIModels =  ASISubGroup.getAsiList();
                                            if(ASIModels) {
                                                //3. Filter ASI by ASI name
                                                for( var m = 0; m< ASIModels.size();m++) {
                                                    var ASIModel = ASIModels.get(m);
                                                    if(ASIModel && ASIModel.getAsiName() == ArrayASIName1) {
                                                        logDebug(ArrayRowViolName + " Change ASI value " + ASIModel.getAsiName() + " from:"+ ASIModel.getAttributeValue() +" to " + ArrayASIValue1);
                                                        //4. Reset ASI value
                                                        ASIModel.setAttributeValue(ArrayASIValue1);
                                                    }
                                                    if(ASIModel && ASIModel.getAsiName() == ArrayASIName2) {
                                                        logDebug(ArrayRowViolName + " Change ASI value " + ASIModel.getAsiName() + " from:"+ ASIModel.getAttributeValue() +" to " + ArrayASIValue2);
                                                        //4. Reset ASI value
                                                        ASIModel.setAttributeValue(ArrayASIValue2);
                                                    }
                                                    if(ASIModel && ASIModel.getAsiName() == ArrayASIName3) {
                                                        logDebug(ArrayRowViolName + " Change ASI value " + ASIModel.getAsiName() + " from:"+ ASIModel.getAttributeValue() +" to " + ArrayASIValue3);
                                                        //4. Reset ASI value
                                                        ASIModel.setAttributeValue(ArrayASIValue3);
                                                    }
                                                }
                                            }
										}
									}
								}
							}
                        }
                    }				
                    //Update the guidesheet
                    var updateResult = aa.guidesheet.updateGGuidesheet(guideSheetObj,guideSheetObj.getAuditID());
                    if (updateResult.getSuccess()) {
                        logDebug("Successfully updated GS Data on inspection " + inspArray[i].getIdNumber() + ".");
                    } else {
                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                        return false;
                    }
                }
            } else {
                // if there are guidesheets
                logDebug("No guidesheets for this inspection");
                return false;
            }
		}
	} else {
		logDebug("No inspections on the record");
		return false;
	}
	logDebug("No updates to the guidesheet made");
	return false;
} 
function updateGuidesheetFieldValueByArrayMultiPermt(updateArr) {
	for (var Permit in updateArr){
		var ArrayCapId = updateArr[Permit][8];
		var r = aa.inspection.getInspections(ArrayCapId);
		if (r.getSuccess()) {
			var inspArray = r.getOutput();
			for (i in inspArray) {
				var vInspId = inspArray[i].getIdNumber();
				var inspModel = inspArray[i].getInspection();
				var gs = inspModel.getGuideSheets();
				if (gs) {
					gsArray = gs.toArray();
					for(gsIdx in gsArray){
						var guideSheetObj = gsArray[gsIdx];
						var guidesheetItem = guideSheetObj.getItems();
						for(var j=0;j< guidesheetItem.size();j++) {
							var item = guidesheetItem.get(j);
							for (var gItem in updateArr){
								var ArraySeqNo = updateArr[gItem][0];
								var ArrayRowViolName = updateArr[gItem][1];
								var ArrayASIName1 = updateArr[gItem][2];
								var ArrayASIValue1 = updateArr[gItem][3];
								var ArrayASIName2 = updateArr[gItem][4];
								var ArrayASIValue2 = updateArr[gItem][5];
								var ArrayASIName3 = updateArr[gItem][6];
								var ArrayASIValue3 = updateArr[gItem][7];
								var ArrayCapId = updateArr[gItem][8];
								var ArrayInspId = updateArr[gItem][9];
								if(parseInt(ArraySeqNo) == item.guideItemSeqNbr && parseInt(ArrayInspId) == vInspId){
									logDebug("DB1.1 " + vInspId)
									//1. Filter Guide Sheet items by Guide sheet item name && ASI group code
									if(item.getGuideItemText() == ArrayRowViolName) {
										var ASISubGroups = item.getItemASISubgroupList();
										if(ASISubGroups) {
											//2. Filter ASI sub group by ASI Sub Group name
											for(var k=0;k< ASISubGroups.size();k++) {
												var ASISubGroup = ASISubGroups.get(k);
                                                var ASIModels =  ASISubGroup.getAsiList();
                                                if(ASIModels) {
                                                    //3. Filter ASI by ASI name
                                                    for( var m = 0; m< ASIModels.size();m++) {
                                                        var ASIModel = ASIModels.get(m);
                                                        if(ASIModel && ASIModel.getAsiName() == ArrayASIName1) {
                                                            logDebug(ArrayRowViolName + " Change ASI value " + ASIModel.getAsiName() + " from:"+ ASIModel.getAttributeValue() +" to " + ArrayASIValue1);
                                                            //4. Reset ASI value
                                                            ASIModel.setAttributeValue(ArrayASIValue1);
                                                        }
                                                        if(ASIModel && ASIModel.getAsiName() == ArrayASIName2) {
                                                            logDebug(ArrayRowViolName + " Change ASI value " + ASIModel.getAsiName() + " from:"+ ASIModel.getAttributeValue() +" to " + ArrayASIValue2);
                                                            //4. Reset ASI value
                                                            ASIModel.setAttributeValue(ArrayASIValue2);
                                                        }
                                                        if(ASIModel && ASIModel.getAsiName() == ArrayASIName3) {
                                                            logDebug(ArrayRowViolName + " Change ASI value " + ASIModel.getAsiName() + " from:"+ ASIModel.getAttributeValue() +" to " + ArrayASIValue3);
                                                            //4. Reset ASI value
                                                            ASIModel.setAttributeValue(ArrayASIValue3);
                                                        }
                                                    }
                                                }
											}
										}
									}
								}
							}
						}				
						//Update the guidesheet
						var updateResult = aa.guidesheet.updateGGuidesheet(guideSheetObj,guideSheetObj.getAuditID());
						if (updateResult.getSuccess()) {
							logDebug("Successfully updated GS Data on inspection " + inspArray[i].getIdNumber() + ".");
						} else {
							logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
							return false;
						}
					}
				} else {
					// if there are guidesheets
					logDebug("No guidesheets for this inspection");
					return false;
				}
			}
		} else {
			logDebug("No inspections on the record");
			return false;
		}
		logDebug("No updates to the guidesheet made");
		return false;
	}

}
function updateGuidesheetItemStatus(inspId, gItem, gItemStatus, itemCap) {
   var r = aa.inspection.getInspections(itemCap);
   if (r.getSuccess()) {
       var inspArray = r.getOutput();
       for (i in inspArray) {
           if (inspArray[i].getIdNumber() == inspId) {
               var inspModel = inspArray[i].getInspection();
               var gs = inspModel.getGuideSheets();
               if (gs) {
                   for (var i = 0; i < gs.size(); i++) {
                       var guideSheetObj = gs.get(i);
                       if (guideSheetObj) {
                           var guidesheetItem = guideSheetObj.getItems();
                           for (var j = 0; j < guidesheetItem.size(); j++) {
                               var item = guidesheetItem.get(j);
                               //1. Filter Guide Sheet items by Guide sheet item name && ASI group code
                               if (item && gItem == item.getGuideItemText()) {
                                   logDebug("Found the item: " + item.getGuideItemText() + " with Status: " + item.getGuideItemStatus());
                                   item.setGuideItemStatus(gItemStatus);
                                   var updateResult = aa.guidesheet.updateGGuidesheet(guideSheetObj, currentUserID).getOutput();
                                   return item.getGuideItemStatus();
                               }
                           }
                           //if we got here then there were no guide sheet items matching the item requested
                           logDebug("No matching guidesheet items found for: " + item);
                           return false;
                       }
                   }
               }
               else {
                   // if there are guidesheets
                   logDebug("No guidesheets for this inspection");
                   return false;
               }
           }
       }
   }
   else {
       logDebug("No inspections on the record");
       return false;
   }
}
function valueExistInASIT2Col(vTableName,keyName1,keyValue1,keyName2,keyValue2,vCapId){
	var tableArr = loadASITable(vTableName, vCapId);
	var matchResult = false;
	if (tableArr) {
		for (var r in tableArr) {
			if (parseInt(tableArr[r][keyName1]) == parseInt(keyValue1) && tableArr[r][keyName2].toString() == keyValue2.toString()) {
				
				matchResult = true;
			}
		}
	}
	return matchResult;
}
function valueExistInASITCol(vTableName,keyName,keyValue,vCapId){
	var tableArr = loadASITable(vTableName, vCapId);
	var matchResult = false;
	if (tableArr) {
		for (var r in tableArr) {
			if (parseInt(tableArr[r][keyName]) == parseInt(keyValue)) {
				matchResult = true;
			}
		}
	}
	return matchResult;
}
function updateFacilityInfo(targetCapId,vFacilityId){
	var capResult = aa.cap.getCap(vFacilityId);
	if(capResult != null){
		var capModel = capResult.getOutput().getCapModel()
		var appName = capModel.getSpecialText();
		var itemName = "Facility ID";
		var itemGroup = null;
		if (useAppSpecificGroupName){
			if (itemName.indexOf(".") < 0)
				{ logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
			itemGroup = itemName.substr(0,itemName.indexOf("."));
			itemName = itemName.substr(itemName.indexOf(".")+1);
		}
		var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(targetCapId,itemName,vFacilityId.getCustomID(),itemGroup);
		if (appSpecInfoResult.getSuccess()){
			logDebug( "INFO: " + itemName + " was updated."); 
		} 	
		else{
			logDebug( "WARNING: " + itemName + " was not updated."); 
		}
		var itemName = "Facility Name";
		var itemGroup = null;
		if (useAppSpecificGroupName){
			if (itemName.indexOf(".") < 0)
				{ logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
			itemGroup = itemName.substr(0,itemName.indexOf("."));
			itemName = itemName.substr(itemName.indexOf(".")+1);
		}
		var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(targetCapId,itemName,appName,itemGroup);
		if (appSpecInfoResult.getSuccess()){
			logDebug( "INFO: " + itemName + " was updated."); 
		} 	
		else{
			logDebug( "WARNING: " + itemName + " was not updated."); 
		}
		var itemName = "Facility DBA";
		var itemGroup = null;
		if (useAppSpecificGroupName){
			if (itemName.indexOf(".") < 0)
				{ logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
			itemGroup = itemName.substr(0,itemName.indexOf("."));
			itemName = itemName.substr(itemName.indexOf(".")+1);
		}
		var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(targetCapId,itemName,getAppSpecific("Facility DBA",vFacilityId),itemGroup);
		if (appSpecInfoResult.getSuccess()){
			logDebug( "INFO: " + itemName + " was updated."); 
		} 	
		else{
			logDebug( "WARNING: " + itemName + " was not updated."); 
		}
		var itemName = "Business Code";
		var itemGroup = null;
		if (useAppSpecificGroupName){
			if (itemName.indexOf(".") < 0)
				{ logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
			itemGroup = itemName.substr(0,itemName.indexOf("."));
			itemName = itemName.substr(itemName.indexOf(".")+1);
		}
		var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(targetCapId,itemName,getAppSpecific("Business Code",vFacilityId),itemGroup);
		if (appSpecInfoResult.getSuccess()){
			logDebug( "INFO: " + itemName + " was updated."); 
		} 	
		else{
			logDebug( "WARNING: " + itemName + " was not updated."); 
		}
		var itemName = "Billing Anniversary";
		var itemGroup = null;
		if (useAppSpecificGroupName){
			if (itemName.indexOf(".") < 0)
				{ logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
			itemGroup = itemName.substr(0,itemName.indexOf("."));
			itemName = itemName.substr(itemName.indexOf(".")+1);
		}
		var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(targetCapId,itemName,getAppSpecific("Billing Anniversary",vFacilityId),itemGroup);
		if (appSpecInfoResult.getSuccess()){
			logDebug( "INFO: " + itemName + " was updated."); 
		} 	
		else{
			logDebug( "WARNING: " + itemName + " was not updated."); 
		}
	}
}

function updateWorkDesc(newWorkDes) // optional CapId
{
	var itemCap = capId
		if (arguments.length > 1)
			itemCap = arguments[1]; // use cap ID specified in args


		var workDescResult = aa.cap.getCapWorkDesByPK(itemCap);
	var workDesObj;

	if (!workDescResult.getSuccess()) {
		aa.print("**ERROR: Failed to get work description: " + workDescResult.getErrorMessage());
		return false;
	}

	var workDesScriptObj = workDescResult.getOutput();
	if (workDesScriptObj) {
		workDesObj = workDesScriptObj.getCapWorkDesModel();
	} else {
		aa.print("**ERROR: Failed to get workdes Obj: " + workDescResult.getErrorMessage());
		return false;
	}

	workDesObj.setDescription(newWorkDes);
	aa.cap.editCapWorkDes(workDesObj);

	aa.print("Updated Work Description to : " + newWorkDes);

}


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