function copyPublicUserToSpecificRecord(contactType,useCapId) {
	if (publicUser) {
		try {
			// get the public user account
			var getUserResult = aa.publicUser.getPublicUserByPUser(publicUserID);

			if (getUserResult.getSuccess() && getUserResult.getOutput()) {
				userModel = getUserResult.getOutput();
				userSeqNum = userModel.getUserSeqNum();
				refContact = getRefContactForPublicUser(userSeqNum)
					if (refContact != null) {
						refContactNum = refContact.getContactSeqNumber();
						addRefContactToRecord(refContactNum, contactType, useCapId);
					} //if (refContact != null)

			} //if (getUserResult.getSuccess() && getUserResult.getOutput())

		} //try
		catch (err) {
			aa.print("A JavaScript Error occurred: " + err.message);
		}
	}
}
