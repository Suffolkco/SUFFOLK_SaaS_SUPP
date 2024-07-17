if (AInfo["Catastrophic Failure"] == "Yes")
					  editAppSpecific("SCORE", 100); 
					if (AInfo["Non-Catastrophic"] == "Yes" && AInfo["Catastrophic Failure"] == "No")
					  editAppSpecific("SCORE", 90); 
					if (AInfo["Priority Area"] == "Priority 1" && AInfo["Catastrophic Failure"] == "No" &&  AInfo["Non-Catastrophic"] == "No")
					  editAppSpecific("SCORE", 80); 
					if (AInfo["Priority Area"] == "Priority 2" && AInfo["Catastrophic Failure"] == "No" &&  AInfo["Non-Catastrophic"] == "No")
					  editAppSpecific("SCORE", 70); 
					if (AInfo["Priority Area"] == "No Priority" && AInfo["Catastrophic Failure"] == "No" &&  AInfo["Non-Catastrophic"] == "No")
					  editAppSpecific("SCORE", 60);