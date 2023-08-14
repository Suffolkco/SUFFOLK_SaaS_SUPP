function capExistsInSet(setId, altId)
{
    var capIdResult = new capSet(setId);
    var alreadyExists = false;
    var capIds = capIdResult.members;
    for (thisCap in capIds) {
        if (altId.toString() == capIds[thisCap].toString()) {
            alreadyExists = true;
            break;
        }
    }
    return alreadyExists;
}