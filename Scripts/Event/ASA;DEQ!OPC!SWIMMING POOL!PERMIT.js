//ASA:DEQ/OPC/SWIMMING POOL/PERMIT

showDebug = false;

var shortNotes = getShortNotes(capId);

// Update project name with application name when submitting . 
if (!publicUser)
{
    updateShortNotes(shortNotes);        
    editAppName(shortNotes);
}


    
