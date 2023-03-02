using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Configuration;
using System.IO;
using System.Net;
using System.Text;
using System.Web;
using Accela.ACA.PaymentAdapter;

namespace Elavon_Adaptor {

    public class AdapterUtil {
         public static string GetConfig(string key) {
            // Scan: Encryption
            //NameValueCollection parameters = ConfigurationManager.GetSection(@"paymentAdapter") as NameValueCollection;

            NameValueCollection parameters = ConfigurationManager.AppSettings;
            return parameters[key].ToString();
        }

         public static string GetRedirectUrlParamToACA(string applicationID, string transactionID, string successCode) {
             StringBuilder paramToACA = new StringBuilder();
             paramToACA.AppendFormat("{0}={1}", PaymentConstant.RETURN_CODE, successCode);
             paramToACA.AppendFormat("&{0}={1}", PaymentConstant.APPLICATION_ID, applicationID);
             paramToACA.AppendFormat("&{0}={1}", PaymentConstant.TRANSACTION_ID, transactionID);
             return paramToACA.ToString();
         }     
    }


}