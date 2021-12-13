function getCapIdByInspID(inspID){
	var returnedCapID;
	var servProvCode=aa.getServiceProviderCode();
	var conn = aa.db.getConnection();
    //var selectString = "select DISTINCT B1_PER_ID1, B1_PER_ID2, B1_PER_ID3 from B3CONTACT WHERE SERV_PROV_CODE= ? AND G1_CONTACT_NBR = ? AND B1_CONTACT_TYPE = ?";
    var selectString = "select DISTINCT B1_PER_ID1, B1_PER_ID2, B1_PER_ID3 from G6ACTION where serv_prov_code= ? and g6_act_num = ?"
	var sStmt = conn.prepareStatement(selectString);
	sStmt.setString(1, servProvCode);
	sStmt.setString(2, inspID);
	var rSet = sStmt.executeQuery();

	while (rSet.next()) {
		var id1= rSet.getString("B1_PER_ID1");
		var id2= rSet.getString("B1_PER_ID2");
        var id3= rSet.getString("B1_PER_ID3");
        aa.print("id1: " + id1 + " id2: " + id2 + " id3: " + id3);
        var resCapID = aa.cap.getCapID(id1,id2,id3);
        aa.print("resCapID: " + resCapID);
		if (resCapID.getSuccess()) {
            returnedCapID = resCapID.getOutput();
            aa.print("inside if: " + returnedCapID);
            aa.print("Alt Id: " + returnedCapID.getCustomID());
		}
	}

	rSet.close();
	sStmt.close();
	conn.close();
	//return resArr;

return returnedCapID;
}