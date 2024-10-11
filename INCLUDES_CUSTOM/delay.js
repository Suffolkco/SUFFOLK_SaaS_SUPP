function delay(ms) {
  var cur_d = new Date();
  var ms_passed = 0;
  var d = new Date();
  try {
  java.lang.Thread.sleep(ms);
  d = new Date();
  ms_passed = d - cur_d;
  logDebug("Delayed " + ms_passed + "ms");
  }
  catch (err) {
  /*
  * This will happen if the sleep is woken up - you might want to check
  * if enough time has passed. (Handled in the while delay loop)
  */
  d = new Date();
  ms_passed = d - cur_d;
  logDebug("sleep interrupted " + err.message + " delayed " + ms_passed + "ms");
  }
  d = new Date();
  ms_passed = d - cur_d;
  if (ms_passed < ms) { // If not enough time has passed execute while delay loop. CPU Intensive.
  while (ms_passed < ms) {
  d = new Date();
  ms_passed = d - cur_d;
  }
  logDebug("Continued delay until " + ms_passed + "ms");
  }
  }
  