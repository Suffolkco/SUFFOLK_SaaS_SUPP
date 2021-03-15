/*------------------------------------------------------------------------------------------------------/
| Script to execute SQL via EMSE
/------------------------------------------------------------------------------------------------------*/
SCRIPT_VERSION = 2.0

/*------------------------------------------------------------------------------------------------------/
| VARIABLE DEFINITIONS
/------------------------------------------------------------------------------------------------------*/
var showDebug = "Y";
var timeExpired = false;
var debug = "";

/*------------------------------------------------------------------------------------------------------/
| Execute the mainprocess function and provide a status of the job that just ran.
/------------------------------------------------------------------------------------------------------*/

if (!timeExpired) var isSuccess = mainProcess();
aa.print(debug);

/*------------------------------------------------------------------------------------------------------/
| This function contains the core logic of the script
/------------------------------------------------------------------------------------------------------*/
function mainProcess() {
    var fvError = null;
    try {

        runSQL();
        
        return true;
    }
    catch (fvError) {
        aa.print("Runtime error occurred: " + fvError);
        return false;
    }
}

/*------------------------------------------------------------------------------------------------------/
| Execute the SQL
/------------------------------------------------------------------------------------------------------*/
function runSQL() {
    var vError = '';
    var conn = null;
    var sStmt1 = null;
    var rret = null;
    try {
        var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
        var ds = initialContext.lookup("java:/AA");
        conn = ds.getConnection();

        var usql = " UPDATE b1permit ";
            usql += " SET rec_status     ='I', ";
            usql += "  REC_FUL_NAM      ='SQL SCRIPT' ";
            usql += " WHERE SERV_PROV_CODE='SUFFOLKCO' ";
            usql += " AND B1_FILE_DD  <= TRUNC(sysdate-15) ";
            usql += " AND REC_STATUS     ='A' ";
            usql += " AND B1_APPL_CLASS IN ('INCOMPLETE CAP','INCOMPLETE TMP','INCOMPLETE EST') ";
            usql += " AND B1_MODULE_NAME= 'DEQ' ";


        sStmt1 = conn.prepareStatement(usql);
        rret = sStmt1.executeQuery();

    } catch (vError) {
        aa.print("Runtime error occurred: " + vError);
    }
    closeDBQueryObject(rret, sStmt1, conn); 
}

function closeDBQueryObject(rSet, sStmt, conn) {
    try {
        if (rSet) {
            rSet.close();
            rSet = null;
        }
    } catch (vError) {
        aa.print("Failed to close the database result set object." + vError);
    }
    try {
        if (sStmt) {
            sStmt.close();
            sStmt = null;
        }
    } catch (vError) {
        aa.print("Failed to close the database prepare statement object." + vError);
    }
    try {
        if (conn) {
            conn.close();
            conn = null;
        }
    } catch (vError) {
        aa.print("Failed to close the database connection." + vError);
    }
}