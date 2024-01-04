//ASA;TE!VIOLATIONS!NA!NA

showDebug = true; 
cap = aa.cap.getCap(capId).getOutput();
if (cap)
{
    var capmodel = aa.cap.getCap(capId).getOutput().getCapModel();
    if (capmodel.isCompleteCap())
    {   
        var facID = getAppSpecific("Facility ID")
        logDebug("Facility ID: " + facID);
      
        var docID = getAppSpecific("Docket Number")
        logDebug("Docket Number: " + docID);

        var comID = getAppSpecific("Complaint Number")
        logDebug("Complaint Number: " + comID);

        var validFacility = false;
        var validComplaint = false;
        var validDocket = false;
        var facCapId;
        var facCapIDString;
        var compCapId;
        var compCapIdString;
        var docCapId;
        var docCapIdString;
        
        // Determine if facility is valid
        if (facID && facID != "")
       {
            var facCapResult = aa.cap.getCapID(facID);
            if (facCapResult.getSuccess())
            {
                facCapId = getApplication(facID);
                facCapIDString = facCapId.getCustomID();
                logDebug("Facility ID found: " + facCapIDString);       
                
                var capmodel = aa.cap.getCap(facCapId).getOutput().getCapModel();
                if (capmodel.isCompleteCap())
                {
                    validFacility = true;                  
                }
                
            }
       }
       // Determine if Complaint is valid
       if (comID && comID != "")
       {
            var comCapResult = aa.cap.getCapID(comID);
            if (comCapResult.getSuccess())
            {           
                compCapId = getApplication(comID);
                comCapIDString = compCapId.getCustomID();
                logDebug("Complaint ID found: " + comCapIDString);       
                
                var compcapmodel = aa.cap.getCap(compCapId).getOutput().getCapModel();
                if (compcapmodel.isCompleteCap())
                {
                    validComplaint = true;
                }               
                
            }   
       }
       // Determine if Docket is valid
       if (docID && docID != "")
        {
            var docCapResult = aa.cap.getCapID(docID);
            if (docCapResult.getSuccess())
            {
                docCapId = getApplication(docID);
                docCapIDString = docCapId.getCustomID();
                logDebug("Docket ID found: " + docCapIDString);       
                
                var capmodel = aa.cap.getCap(docCapId).getOutput().getCapModel();
                if (capmodel.isCompleteCap())
                {
                    validDocket = true;                  
                }              
                
            }

        }


        // Link them: Facility -> Complaint -> Docket -> Violations
        if (validFacility && validComplaint && validDocket)
        {
            // Add Facility to be the parent of violation
            logDebug("Add " + facCapIDString + ' as parent to ' + capId.getCustomID());     
            addParentChildRelationship(facCapId, compCapId);
            logDebug("Add " + compCapIdString + ' as parent to ' + docCapId.getCustomID());     
            addParentChildRelationship(compCapId, docCapId);
            logDebug("Add " + docCapIdString + ' as parent to ' + capId.getCustomID());     
            addParent(docCapId);         
        }
        else if (!validFacility && validComplaint && !validDocket)
        {

        }

        
       


        

        
        
        
    }    
        

   
}

function addParentChildRelationship(parentAppNum, childAppNum) 
//
// adds the current application to the parent
//
	{
	var getCapResult = aa.cap.getCapID(parentAppNum);
	if (getCapResult.getSuccess())
	{
		var parentId = getCapResult.getOutput();

        var childCapResult = aa.cap.getCapID(childAppNum);
        if (childCapResult.getSuccess())
        {
            var childId = getCapResult.getOutput();
            var linkResult = aa.cap.createAppHierarchy(parentId, childId);
            if (linkResult.getSuccess())
                logDebug("Successfully linked to Parent Application : " + parentAppNum);
            else
                logDebug( "**ERROR: linking to parent application parent cap id (" + parentAppNum + "): " + linkResult.getErrorMessage());
		}
    }
	else
		{ logDebug( "**ERROR: getting parent cap id (" + parentAppNum + "): " + getCapResult.getErrorMessage()) }
	}
			

function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}

function doSQLSelect_local(sql)
{
    try
    {
        //logdebug("iNSIDE FUNCTION");
        var array = [];
        var conn = aa.db.getConnection();
        var sStmt = conn.prepareStatement(sql);
        if (sql.toUpperCase().indexOf("SELECT") == 0)
        {
            //logdebug("executing " + sql);
            var rSet = sStmt.executeQuery();
            while (rSet.next())
            {
                var obj = {};
                var md = rSet.getMetaData();
                var columns = md.getColumnCount();
                for (i = 1; i <= columns; i++)
                {
                    obj[md.getColumnName(i)] = String(rSet.getString(md.getColumnName(i)));
                    //logdebug(rSet.getString(md.getColumnName(i)));
                }
                obj.count = rSet.getRow();
                array.push(obj)
            }
            rSet.close();
            //logdebug("...returned " + array.length + " rows");
            //logdebug(JSON.stringify(array));
        }
        sStmt.close();
        conn.close();
        return array
    } catch (err)
    {
        //logdebug("ERROR: "+ err.message);
        return array
    }
}

