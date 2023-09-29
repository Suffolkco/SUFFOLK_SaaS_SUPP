function getRefGSItemComment(GSItem){
	var strReturn = null;
    var sql = "SELECT GUIDE_ITEM_COMMENT FROM RGUIDESHEET_ITEM WHERE GUIDE_ITEM_TEXT = '$$GuideItem$$' AND SERV_PROV_CODE = '$$servProvCode$$' AND REC_STATUS = 'A'";
    sql = sql.replace("$$GuideItem$$", GSItem).replace("$$servProvCode$$", aa.getServiceProviderCode());
    var r = aa.db.select(sql, new Array()).getOutput();
    var result = new Array();
    if (r.size() > 0){
        r = r.toArray();
        for (var x in r){
            var thisGuideComment = r[x].get("GUIDE_ITEM_COMMENT");
            result.push(thisGuideComment);
        }
    }
	if(result.length > 0){
		strReturn = result[0];
	}
	return strReturn;
}