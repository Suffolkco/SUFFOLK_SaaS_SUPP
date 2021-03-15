using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Configuration;
using System.IO;
using System.Net;
using System.Text;
using System.Web;

namespace Elavon_Adaptor {

    public class PostHelper {

        public static void doPost(string postURL, string staticParams,  Hashtable postParams, log4net.ILog _logger) {
            StringBuilder postDataSB = new StringBuilder();
            // Get the static parameters...
            if (staticParams != String.Empty) {
                string[] pieces = staticParams.Split('|');
                if (pieces.Length > 0) {
                    foreach (string s in pieces) {
                        string[] parts = s.Split('=');
                        if (parts.Length == 2) {
                            postDataSB.AppendFormat("{0}={1}&", HttpUtility.UrlEncode(parts[0]), HttpUtility.UrlEncode(parts[1]));
                        }
                    }
                }
            }
            foreach (DictionaryEntry pair in postParams) {
                postDataSB.AppendFormat("{0}={1}&", HttpUtility.UrlEncode(pair.Key.ToString()), HttpUtility.UrlEncode(pair.Value.ToString())); 
            }
            string postData = postDataSB.ToString().TrimEnd('&');
            _logger.DebugFormat("postURL = {1}, postData = {0}", postData, postURL);
            // Prepare web request...
            HttpWebRequest myRequest = (HttpWebRequest)WebRequest.Create(postURL);
            myRequest.Method = "POST";
            myRequest.ContentType = "application/x-www-form-urlencoded";
            myRequest.ContentLength = postData.ToString().Length;
            StreamWriter writer = null;
            try {
                writer = new StreamWriter(myRequest.GetRequestStream());
                writer.Write(postData);
            }
            catch (Exception ex) {
                _logger.DebugFormat("Exception writing request {0}", ex.Message);
            }
            finally {
                if (writer != null)
                    writer.Close();
            }

        }
    }
}