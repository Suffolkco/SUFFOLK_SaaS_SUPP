using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Configuration;
using System.Text;
using System.Web;
using Accela.ACA.PaymentAdapter;

namespace Elavon_Adaptor
{
  
    public partial class TestPage : System.Web.UI.Page {

        private static readonly log4net.ILog _logger = LogFactory.Instance.GetLogger(typeof(TestPage));
        private long _timeFlag;
        private System.Diagnostics.Stopwatch _watch = null;
        private string _responseText = "success=false";

        #region Constructors

        
        public TestPage()
        {
            _timeFlag = DateTime.Now.Ticks;
            _watch = new System.Diagnostics.Stopwatch();
            _watch.Start();
            _logger.DebugFormat("---Page {0} Load begin [{1}]---", this.GetType().FullName, _timeFlag.ToString());
        }
        #endregion

        public override void Dispose()
        {
            base.Dispose();

            _watch.Stop();
            _logger.DebugFormat("Page {0} Run Total Time : {1} ms.", this.GetType().FullName, _watch.ElapsedMilliseconds.ToString());
            _logger.DebugFormat("---Page {0} Load End [{1}]---", this.GetType().FullName, _timeFlag.ToString());
            _watch = null;
        } 

        protected void Page_Load(object sender, EventArgs e)
        {
            // 01. Request from ACA (I)
            Hashtable parameters = ParameterHelper.GetParameterMapping(ActionType.FromACA);
            string queryString = ParameterHelper.GetReqeustParameters();
            string redirectURL = ParameterHelper.GetParameterByKey(parameters, PaymentConstant.REDIRECT_URL);
            string postbackURL = ParameterHelper.GetParameterByKey(parameters, PaymentConstant.POSTBACK_URL);
            string applicationID = ParameterHelper.GetParameterByKey(parameters, PaymentConstant.APPLICATION_ID);
            string transactionID = ParameterHelper.GetParameterByKey(parameters, PaymentConstant.TRANSACTION_ID);
            string agencyCode = ParameterHelper.GetParameterByKey(parameters, PaymentConstant.AGENCY_CODE);
            string userID = ParameterHelper.GetParameterByKey(parameters, PaymentConstant.USER_ID);
            string payment_type = ParameterHelper.GetParameterByKey(parameters, PaymentConstant.PAYMENT_TYPE);

            if (String.IsNullOrEmpty(queryString))
            {
                 HttpContext.Current.Response.Write("The query string is null.");
                return;
            }

           // HttpContext.Current.Response.Write("Query string: " + queryString + "<br>");
            _logger.DebugFormat("Query string from ACA is {0}", queryString);

            // Get the pay amount and convenience fee, then format it
            string amount = ParameterHelper.GetParameterByKey(parameters, PaymentConstant.PAYMENT_AMOUNT);
            if (String.IsNullOrEmpty(amount)) {
                amount = "0.00";
            }
           // HttpContext.Current.Response.Write("Payment Amount = " + amount + "<br>");

            string convFee = ParameterHelper.GetParameterByKey(parameters, PaymentConstant.CONVENIENCE_FEE);
            if (String.IsNullOrEmpty(convFee))
            {
                convFee = "0.00";
            }
           // HttpContext.Current.Response.Write("Convenience Fee = " + convFee + "<br>");

           // HttpContext.Current.Response.Write("Redirect URL = " + redirectURL + "<br>");
            _logger.DebugFormat("Redirect URL = {0}", redirectURL);
          //  HttpContext.Current.Response.Write("Postback URL = " + postbackURL + "<br>");
            _logger.DebugFormat("Postback URL = {0}", postbackURL);
           // HttpContext.Current.Response.Write("Transaction ID = " + transactionID + "<br>");
            _logger.DebugFormat("Transaction ID = {0}", transactionID);

            string errorMessage = String.Empty;
            Hashtable urlParams = new Hashtable();

            // create a dummy payment response
            completePayment(transactionID, amount);
           
        }

        private void completePayment(string transactionID, string amount) {
            string redirectUrl = String.Empty;
            Hashtable parameters = ParameterHelper.GetParameterMapping(ActionType.FromThirdParty);
            PaymentResult paymentResult = new PaymentResult();
            paymentResult.LOCALREFID = transactionID;
            _logger.DebugFormat("Transaction ID = {0}", paymentResult.LOCALREFID);
            paymentResult.TOTALAMOUNT = amount;
            _logger.DebugFormat("Payment Amount = {0}", paymentResult.TOTALAMOUNT);
            paymentResult.LAST4NUMBER = "1212";
            _logger.DebugFormat("Last 4 numbers of CC = {0}", paymentResult.LAST4NUMBER);
            paymentResult.NAME = "Tester T. Test";
            _logger.DebugFormat("Billing Name {0}", paymentResult.NAME);
            paymentResult.PAYTYPE = "Credit Card";
            paymentResult.CreditCardType = "Visa";
            _logger.DebugFormat("Credit Card Type = {0}", paymentResult.CreditCardType);
            paymentResult.AUTHCODE = "OK";

            _logger.Debug("Do payment and return redirect URL");
            redirectUrl = DoPaymentAndReturnRedirectUrl(parameters, paymentResult);
            _logger.Info("Redirect URL = " + redirectUrl);


            if (!String.IsNullOrEmpty(redirectUrl)) {
                _logger.DebugFormat("Redirecting to : {0} ", redirectUrl);
                 //Response.Redirect(redirectUrl);
                // Need to do the below for the Woolpert hosted sites cause they look externally like the same server.
                Response.Clear();

                StringBuilder sb = new StringBuilder();
                sb.Append("<html>");
                sb.AppendFormat(@"<body onload='document.forms[""form""].submit()'>");
                sb.AppendFormat("<form name='form' action='{0}' method='post'>", redirectUrl);
                sb.AppendFormat("<input type='hidden' name='ReturnCode' value='{0}'>", 1);
                sb.AppendFormat("<input type='hidden' name='ApplicationID' value='1'>");
                sb.AppendFormat("<input type='hidden' name='TransactionID' value='{0}'>", transactionID);
                sb.AppendFormat("<input type='hidden' name='UserMessage' value=''>");
                // Other params go here
                sb.Append("</form>");
                sb.Append("</body>");
                sb.Append("</html>");

                Response.Write(sb.ToString());

                Response.End();

            }
        }

        private string DoPaymentAndReturnRedirectUrl(Hashtable parameters, PaymentResult paymentResult) {
            string returnRedirectUrl = String.Empty;

            string transactionID = paymentResult.LOCALREFID;
            _logger.DebugFormat("Got transaction ID {0} from paymentResult object", transactionID);
            string applicationID = "1";
            string queryString = ParameterHelper.GetReqeustParameters();
            string redirectURL = GetConfig("ACARedirectURL");
            string postbackURL = GetConfig("ACAPostbackURL");
            //string ACAUser = ParameterHelper.GetParameterByKey(parameters, PaymentConstant.USER_ID);

            if (String.IsNullOrEmpty(queryString)) {
                _logger.Debug("05. Notification from Provider (I), the parameter is empty.");
            }

            if (!String.IsNullOrEmpty(transactionID) && !String.IsNullOrEmpty(applicationID)) {

                StringBuilder responseData = new StringBuilder();

                responseData.AppendFormat("{0}={1}", PaymentConstant.TRANSACTION_ID, paymentResult.LOCALREFID);
                responseData.AppendFormat("&{0}={1}", PaymentConstant.CC_NUMBER, paymentResult.LAST4NUMBER);
                responseData.AppendFormat("&{0}={1}", PaymentConstant.PAYMENT_AMOUNT, paymentResult.TOTALAMOUNT);
                responseData.AppendFormat("&{0}={1}", PaymentConstant.CONVENIENCE_FEE, "0");
                responseData.AppendFormat("&{0}={1}", PaymentConstant.CC_TYPE, paymentResult.CreditCardType);
                responseData.AppendFormat("&{0}={1}", PaymentConstant.PROC_TRANS_TYPE, paymentResult.PAYTYPE);
                responseData.AppendFormat("&{0}={1}", PaymentConstant.PROC_TRANS_ID, paymentResult.AUTHCODE);
                responseData.AppendFormat("&{0}={1}", PaymentConstant.PAYEE, paymentResult.NAME);
                responseData.AppendFormat("&{0}={1}", PaymentConstant.PAYEE_ADDRESS, String.Format("{0},{1} {2} {3} {4}", paymentResult.ADDRESS1, paymentResult.ADDRESS2, paymentResult.CITY, paymentResult.STATE, paymentResult.COUNTRY));
                responseData.AppendFormat("&{0}={1}", PaymentConstant.PAYEE_PHONE, paymentResult.PHONE);

                _logger.Debug("ResponseData = " + responseData.ToString());

                // Get response result from ACA, if create cap successful, it will return success=true
                _logger.DebugFormat("Doing postback to {0}", postbackURL);
                string data = PaymentHelper.DoPostBack(postbackURL, responseData.ToString());

                // data is what is returned from ACA after the post back
                _logger.Debug("data returned from postback = " + data);
                if (!String.IsNullOrEmpty(data)) {

                    data = data.Replace("user_message", PaymentConstant.USER_MESSAGE);
                }


                // Update transaction when finished payment
                Hashtable responseParams = ParameterHelper.SplitResponseText(ActionType.FromACA, data, '&');

                string result = this.FormatPostbackData(data, transactionID);

                string paramToACA = GetRedirectUrlParamToACA(result, applicationID, transactionID);
                _logger.Debug("paramToACA = " + paramToACA);
                returnRedirectUrl = String.Format("{0}?{1}", redirectURL, paramToACA);

                _logger.Debug(returnRedirectUrl);
            }

            else {
                // Log exception message
                string message = String.IsNullOrEmpty(queryString) ? "empty" : queryString;
                _logger.DebugFormat("Can not get transactionID or applicationID from configuration, the queryString is {0}", message);

                string paramToACA = GetRedirectUrlParamToACA(_responseText, applicationID, transactionID);

                returnRedirectUrl = String.Format("{0}?{1}", redirectURL, paramToACA);
            }

            return returnRedirectUrl;
        }


        private string FormatPostbackData(string responseText, string transactionId) {
            Hashtable param = ParameterHelper.SplitResponseText(ActionType.FromACA, responseText, '&');

            string success = ParameterHelper.GetParameterByKey(param, PaymentConstant.ACA_TRANS_SUCCESS);
            string message = ParameterHelper.GetParameterByKey(param, PaymentConstant.USER_MESSAGE);

            if (!String.IsNullOrEmpty(message)) {
                message = HttpUtility.UrlEncode(message);
                PaymentHelper.SetDataToCache<string>(transactionId, message, 120);
            }

            return String.Format("success={0}&user_message={1}&remittance_id={2}", success, message, transactionId);
        }

        private string GetRedirectUrlParamToACA(string responseText, string applicationID, string transactionID) {
            Hashtable param = ParameterHelper.SplitResponseText(ActionType.FromACA, responseText, '&');

            string success = ParameterHelper.GetParameterByKey(param, PaymentConstant.ACA_TRANS_SUCCESS);
            string message = ParameterHelper.GetParameterByKey(param, PaymentConstant.USER_MESSAGE);

            StringBuilder paramToACA = new StringBuilder();

            if ("true".Equals(success, StringComparison.OrdinalIgnoreCase)) {
                paramToACA.AppendFormat("{0}={1}", PaymentConstant.RETURN_CODE, PaymentConstant.SUCCESS_CODE);
            }
            else {
                paramToACA.AppendFormat("{0}={1}", PaymentConstant.RETURN_CODE, PaymentConstant.FAILURE_CODE);
            }

            paramToACA.AppendFormat("&{0}={1}", PaymentConstant.APPLICATION_ID, applicationID);
            paramToACA.AppendFormat("&{0}={1}", PaymentConstant.TRANSACTION_ID, transactionID);
            paramToACA.AppendFormat("&{0}={1}", PaymentConstant.USER_MESSAGE, message);
            _logger.Debug("GetRedirectUrlParamToACA " + paramToACA.ToString());
            return paramToACA.ToString();
        }    

        private string GetConfig(string key) {
            NameValueCollection parameters = ConfigurationManager.GetSection(@"paymentAdapter") as NameValueCollection;
            return parameters[key].ToString();
        }

  
        private bool IsValidCurrency(string currency)
        {
            bool isValid = false;
            double dbValue = 0;

            if (Double.TryParse(currency, out dbValue))
            {
                if (!currency.Contains("."))
                {
                    isValid = true;
                }
                else
                {
                    int precision = currency.Length - currency.IndexOf('.') - 1;
                    if (precision <= 2)
                    {
                        isValid = true;
                    }
                }
            }

            return isValid;
        }      
    }
}