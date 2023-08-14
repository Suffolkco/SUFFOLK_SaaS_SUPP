function getAAUserEmail(userId){
   var email = aa.person.getUser(userId.toUpperCase()+"").getOutput().getEmail();
   logDebug("AA User email ID : "+email);
   return email;
}