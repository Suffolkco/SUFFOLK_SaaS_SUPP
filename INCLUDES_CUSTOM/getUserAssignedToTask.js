function getUserAssignedToTask(vCapId,taskName){
    currentUsrVar = null
    var taskResult1 = aa.workflow.getTask(vCapId,taskName);
    if (taskResult1.getSuccess()){
        tTask = taskResult1.getOutput();
    }
    else{
        logMessage("**ERROR: Failed to get workflow task object ");
        return false;
    }
    taskItem = tTask.getTaskItem()
    taskUserObj = tTask.getTaskItem().getAssignedUser()

    if(taskUserObj != null){
        return taskUserObj;
    }
    else{
        return false;
    }
}