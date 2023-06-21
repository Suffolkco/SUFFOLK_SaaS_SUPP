// Event: ASIUA
// Trigger: Application Specific Info Update After
// This script will create a Facility Record (EnvHealth/Facility/NA/NA) as a parent when "Does this application require a new facility?" is set to "Yes"

// Check if the ASI field "Does this application require a new facility?" is set to "Yes"
var requireNewFacility = getAppSpecific("Does this application require a new facility?");
if (requireNewFacility == "Yes") {
    // Create a new Facility Record and make it a parent
    var parentRecResult = createParent("EnvHealth", "Facility", "NA", "NA");
    if (parentRecResult) {
        // Copy Address, Parcel, Owner, and Contacts to the parent Facility Record
        copyAddresses(capId, parentRecResult);
        copyParcels(capId, parentRecResult);
        copyOwner(capId, parentRecResult);
        //copyASIFields(capId, parentRecResult);
        //copyUniqueContacts(capId, parentRecResult);

        logDebug("Parent Facility Record created and related: " + parentRecResult.getCustomID());

        // Copy Days/Hours of operation from Application to Facility
        var daysOp = getAppSpecific("Days of Operation",capId);
        editAppSpecific("Days of Operation", daysOp, parentRecResult);
        logDebug("Updated Days of operation ASI to: " + getAppSpecific("Days of Operation", parentRecResult));
        var hrsOp = getAppSpecific("Hours of Operation",capId);
        editAppSpecific("Hours of Operation", hrsOp, parentRecResult);
        logDebug("Updated Hours of operation ASI to: " + getAppSpecific("Hours of Operation", parentRecResult));

        // Copy the Facility DBA Name
        var dbaName = getAppSpecific("Facility Name",capId);				
        editAppSpecific("Facility Name", dbaName, parentRecResult);
        logDebug("Updated Facility Name ASI to: " + getAppSpecific("Facility Name", parentRecResult));

        // Copy the Water Supply
        var waterSupply = getAppSpecific("Water Supply",capId);				
        editAppSpecific("Water Supply", waterSupply, parentRecResult);
        logDebug("Updated Water Supply ASI to: " + getAppSpecific("Water Supply", parentRecResult));


        // Copy the Septic/Sewage
        var ss = getAppSpecific("Septic/Sewage",capId);				
        editAppSpecific("Septic/Sewage", ss, parentRecResult);
        logDebug("Updated Septic/Sewage ASI to: " + getAppSpecific("Septic/Sewage", parentRecResult));

        // Copy the Number of seats
        var noOfSeats = getAppSpecific("Number of Seats",capId);				
        editAppSpecific("Number of Seats", noOfSeats, parentRecResult);
        logDebug("Updated Number of Seats ASI to: " + getAppSpecific("Number of Seats", parentRecResult));

        // Copy the Type of Establishment
        var noOfSeats = getAppSpecific("Type of Establishment",capId);				
        editAppSpecific("Type of Establishment", noOfSeats, parentRecResult);
        logDebug("Updated Type of Establishment ASI to: " + getAppSpecific("Type of Establishment", parentRecResult));


        // Copy the Type of Ownership
        var noOfSeats = getAppSpecific("Type of Ownership",capId);				
        editAppSpecific("Type of Ownership", noOfSeats, parentRecResult);
        logDebug("Updated Type of Ownership ASI to: " + getAppSpecific("Type of Ownership", parentRecResult));


        // Update "Does this application require a new facility?" back to "No"
        editAppSpecific("Does this application require a new facility?", "No");

        // Populate the "Facility ID" on the application with the ID of the newly created Facility record
        editAppSpecific("Facility ID", parentRecResult.getCustomID());
    } else {
        logDebug("Error: Unable to create parent Facility Record.");
    }
}

// Update shortnote name with Program Element
updateWorkDesc(AInfo["Program Element"], capId);


function copyUniqueContacts(pFromCapId, pToCapId) {
    // Copies all unique contacts from pFromCapId to pToCapId
    if (pToCapId == null) {
        var vToCapId = capId;
    } else {
        var vToCapId = pToCapId;
    }

    var capContactResult = aa.people.getCapContactByCapID(pFromCapId);
    var targetContactResult = aa.people.getCapContactByCapID(pToCapId);
    var copied = 0;

    if (capContactResult.getSuccess() && targetContactResult.getSuccess()) {
        var sourceContacts = capContactResult.getOutput();
        var targetContacts = targetContactResult.getOutput();
        var targetSeqNums = targetContacts.map(function (contact) {
            return contact.getCapContactModel().getPeople().getContactSeqNumber();
        });

        for (var yy in sourceContacts) {
            var sourceContact = sourceContacts[yy].getCapContactModel();
            var isContactExist = targetSeqNums.indexOf(sourceContact.getPeople().getContactSeqNumber()) !== -1;

            if (!isContactExist) {
                // Retrieve contact address list and set to related contact
                var contactAddressrs = aa.address.getContactAddressListByCapContact(sourceContact);
                if (contactAddressrs.getSuccess()) {
                    var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());
                    sourceContact.getPeople().setContactAddressList(contactAddressModelArr);
                }

                sourceContact.setCapID(vToCapId);
                // Create cap contact, contact address and contact template
                aa.people.createCapContactWithAttribute(sourceContact);
                copied++;
                logDebug("Copied contact from " + pFromCapId.getCustomID() + " to " + vToCapId.getCustomID());
            }
        }
    } else {
        logMessage("**ERROR: Failed to get contacts: " + capContactResult.getErrorMessage());
        return false;
    }
    return copied;
}


