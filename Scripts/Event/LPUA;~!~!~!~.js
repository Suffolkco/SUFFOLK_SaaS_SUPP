if(aa.env.getValue("CapIdModel") != ""){
	sca = String(aa.env.getValue("CapIdModel")).split("-");
	itemCap = aa.cap.getCapID(sca[0],sca[1],sca[2]).getOutput();
        createupdateRefLPFromRecordLP(itemCap);
}