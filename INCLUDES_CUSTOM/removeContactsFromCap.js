function removeContactsFromCap(vCapId){
    var cons = aa.people.getCapContactByCapID(vCapId).getOutput();
    for (x in cons){
        conSeqNum = cons[x].getPeople().getContactSeqNumber();
        if (conSeqNum){ 
            aa.people.removeCapContact(vCapId, conSeqNum);
        }
    }
}