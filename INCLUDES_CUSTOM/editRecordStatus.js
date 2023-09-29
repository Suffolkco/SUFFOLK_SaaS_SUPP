function editRecordStatus(targetCapId, strStatus){
    var capModel = aa.cap.getCap(targetCapId).getOutput();
    capModel.setCapStatus(strStatus);
    aa.cap.editCapByPK(capModel.getCapModel());
 }