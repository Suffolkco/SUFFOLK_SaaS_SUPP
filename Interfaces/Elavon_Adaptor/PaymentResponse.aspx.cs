using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Configuration;
using System.Net;
using System.Web;
using System.Text;
using Accela.ACA.PaymentAdapter;
using Elavon_Adaptor.Connectivity;

namespace Elavon_Adaptor  {

    /// <summary>
    /// deal with successful payment
    /// </summary>
    public partial class PaymentResponse : System.Web.UI.Page
    {
        private static readonly log4net.ILog _logger = LogFactory.Instance.GetLogger(typeof(PaymentResponse));
        private long _timeFlag;
        private string _responseText = "success=false";

        public PaymentResponse()
        {
            _timeFlag = DateTime.Now.Ticks;

            _logger.DebugFormat("---Page {0} Load begin [{1}]---", this.GetType().FullName, _timeFlag.ToString());
        }

        /// <summary>
        /// do dispose when leave this page
        /// </summary>
        public override void Dispose()
        {
            base.Dispose();

            _logger.DebugFormat("---Page {0} Load End [{1}]---", this.GetType().FullName, _timeFlag.ToString());
        } 

    
        protected void Page_Load(object sender, EventArgs e) {

            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

            string postBackData = String.Empty;
            string redirectUrl = GetConfig("ACARedirectURL");
            string applicationID = PaymentHelper.GetDataFromCache<string>(PaymentConstant.APPLICATION_ID);
            string qString = ParameterHelper.GetReqeustParameters();
            _logger.DebugFormat("PaymentResponse - Query string is {0}", qString);
            string transactionID = ParameterHelper.GetParameterByKey("ssl_invoice_number");
            string convergeID = ParameterHelper.GetParameterByKey("ssl_txn_id");
            string transType = ParameterHelper.GetParameterByKey("ssl_transaction_type");

             if (String.IsNullOrEmpty(qString)) {
                _logger.Debug("Payment response message from Converge : The query string is null.");
                return;
            }
            string result = ParameterHelper.GetParameterByKey("ssl_result");
            string resultMessage = ParameterHelper.GetParameterByKey("ssl_result_message");
            StringBuilder paramToACA;
            _logger.DebugFormat("Result {0}, result message {1}", result, resultMessage);
            if (result == "0") {

                if (transType == "SALE")
                {
                    postBackData = postPayment(transactionID, PaymentConstant.PAY_METHOD_CREDIT_CARD, convergeID);
                }
                else
                {
                    postBackData = postPayment(transactionID, PaymentConstant.PAY_METHOD_CHECK, convergeID);
                }
                
                string postbackResult = this.FormatPostbackData(postBackData, transactionID);
                paramToACA = new StringBuilder();
                 paramToACA.AppendFormat("{0}={1}", PaymentConstant.RETURN_CODE, PaymentConstant.SUCCESS_CODE);
                 paramToACA.AppendFormat("&{0}={1}", PaymentConstant.APPLICATION_ID, applicationID);
                 paramToACA.AppendFormat("&{0}={1}", PaymentConstant.TRANSACTION_ID, transactionID);
                 redirectUrl = String.Format("{0}?{1}", redirectUrl, paramToACA.ToString());
                 if (!String.IsNullOrEmpty(redirectUrl)) {
                     _logger.DebugFormat("Redirecting to {0} ", redirectUrl);
                     Response.Redirect(redirectUrl);
                 }
            }
            else {
                 _logger.DebugFormat("Payment Error received from Converge, result = {0}, resultMessage = {1}", result, resultMessage);
                 string errorMessage = "General decline";
                 try {
                     errorMessage = AdapterUtil.GetConfig(resultMessage);
                 }
                 catch (Exception ex) {
                     _logger.DebugFormat("Exception getting error message, reason code {0}, {1}", resultMessage, ex.Message);
                 }
                 paramToACA = new StringBuilder();
                 paramToACA.AppendFormat("{0}={1}", PaymentConstant.RETURN_CODE, PaymentConstant.FAILURE_CODE);
                 paramToACA.AppendFormat("&{0}={1}", PaymentConstant.APPLICATION_ID, applicationID);
                 paramToACA.AppendFormat("&{0}={1}", PaymentConstant.TRANSACTION_ID, transactionID);
                 paramToACA.AppendFormat("&{0}={1}", PaymentConstant.USER_MESSAGE, errorMessage);
                 redirectUrl = String.Format("{0}?{1}", redirectUrl, paramToACA.ToString());
                 if (!String.IsNullOrEmpty(redirectUrl)) {
                     _logger.DebugFormat("Redirecting to {0} ", redirectUrl);
                     Response.Redirect(redirectUrl);
                 }

            }
        }    

        private string postPayment(string transactionID, string payType, string security_id) {
            string transAmt = ParameterHelper.GetParameterByKey("ssl_amount");
            string convFee = "0.00";
            string amtPaid = "0.00";
            try {
                convFee = PaymentHelper.GetDataFromCache<string>(transactionID + "ConvFee");
                if (String.IsNullOrEmpty(convFee))
                    convFee = "0.00";
            }
            catch (Exception ec) { };
            _logger.DebugFormat("COnv fee switch {0} conv fee amount = {1}", ConfigurationManager.AppSettings["AddConvFee"].ToString(), convFee);
            if (ConfigurationManager.AppSettings["AddConvFee"].ToString() == "false")
                amtPaid = (Double.Parse(transAmt) + Double.Parse(convFee)).ToString();
            else
                amtPaid = (Double.Parse(transAmt).ToString());
            string paymentMethod = String.Empty;
            switch (payType) {
                case "card":
                case "Credit Card":
                    paymentMethod = "Credit Card";
                    break; 
                case "Check":
                    paymentMethod = "Check";
                    break;
                default:
                    _logger.DebugFormat("Unknown payment type {0}", payType);
                    paymentMethod = "Credit Card";
                    break;
            }
            string data = String.Empty;
            if (paymentMethod == "Credit Card") {
                _logger.Debug("Processing a credit card payment");
                string reqCardType = ParameterHelper.GetParameterByKey("ssl_card_short_description");
                string cardType = String.Empty;
                switch (reqCardType) {
                    case "VISA": cardType = "Visa"; break;
                    case "MC": cardType = "MasterCard"; break;
                    default: cardType = "Other"; break;
                }
                StringBuilder responseData = new StringBuilder();
                responseData.AppendFormat("{0}={1}", PaymentConstant.TRANSACTION_ID, transactionID);


                Double origAmt = (Double.Parse(amtPaid) - 0.11) / 1.0154;

                responseData.AppendFormat("&{0}={1}", PaymentConstant.PAYMENT_AMOUNT, String.Format("{0:0.00}", origAmt));
                //  if (ConfigurationManager.AppSettings["AddConvFee"].ToString() == "false")
                //     responseData.AppendFormat("&{0}={1}", PaymentConstant.CONVENIENCE_FEE,"0.00");
                //  else
                Double calculatedConvFee = Double.Parse(amtPaid) - origAmt;
                responseData.AppendFormat("&{0}={1}", PaymentConstant.CONVENIENCE_FEE, String.Format("{0:0.00}", calculatedConvFee));

                responseData.AppendFormat("&{0}={1}", PaymentConstant.CC_TYPE, cardType.Substring(0, Math.Min(cardType.Length, 30)));
                responseData.AppendFormat("&{0}={1}", PaymentConstant.PROC_TRANS_ID, security_id);
                responseData.AppendFormat("&{0}={1}", PaymentConstant.PROC_TRANS_TYPE, paymentMethod);
                _logger.DebugFormat("Posting payment of amount {0}, payment method {1}", amtPaid, paymentMethod);

                string respData = responseData.ToString();
                _logger.DebugFormat("responseData = {0}", respData);
                _logger.DebugFormat("Doing postback to {0}", AdapterUtil.GetConfig("ACAPostbackURL"));
                data = PaymentHelper.DoPostBack(AdapterUtil.GetConfig("ACAPostbackURL"), respData);
                _logger.DebugFormat("Return from postback = {0}", data);
                return data;
            }
            else {
                _logger.Debug("Processing payment by check");
                StringBuilder responseData = new StringBuilder();

                Double origAmt = (Double.Parse(amtPaid) - 0.28);

                responseData.AppendFormat("{0}={1}", PaymentConstant.TRANSACTION_ID, transactionID);
                responseData.AppendFormat("&{0}={1}", PaymentConstant.PAYMENT_AMOUNT, String.Format("{0:0.00}", origAmt));
                responseData.AppendFormat("&{0}={1}", PaymentConstant.CONVENIENCE_FEE, 0.28);
                responseData.AppendFormat("&{0}={1}", PaymentConstant.PROC_TRANS_TYPE, paymentMethod);
                responseData.AppendFormat("&{0}={1}", PaymentConstant.PROC_TRANS_ID, security_id);
                _logger.DebugFormat("Posting payment of amount {0}, payment method {2}", amtPaid, paymentMethod);
                data = PaymentHelper.DoPostBack(AdapterUtil.GetConfig("ACAPostbackURL"), responseData.ToString());
                _logger.DebugFormat("return from postback = {0}", data);
                return data;
            }
            return string.Empty;
        }

        private string GetConfig(string key) {
            NameValueCollection parameters = ConfigurationManager.GetSection(@"paymentAdapter") as NameValueCollection;
            return parameters[key].ToString();
        }

      
        private string GetRedirectUrlParamToACA(string responseText, string applicationID, string transactionID)    {
            Hashtable param = ParameterHelper.SplitResponseText(ActionType.FromACA, responseText, '&');

            string success = ParameterHelper.GetParameterByKey(param, PaymentConstant.ACA_TRANS_SUCCESS);
            string message = ParameterHelper.GetParameterByKey(param, PaymentConstant.USER_MESSAGE);

            StringBuilder paramToACA = new StringBuilder();

            if ("true".Equals(success, StringComparison.OrdinalIgnoreCase))
            {
                paramToACA.AppendFormat("{0}={1}", PaymentConstant.RETURN_CODE, PaymentConstant.SUCCESS_CODE);
            }
            else
            {
                paramToACA.AppendFormat("{0}={1}", PaymentConstant.RETURN_CODE, PaymentConstant.FAILURE_CODE);
            }

            paramToACA.AppendFormat("&{0}={1}", PaymentConstant.APPLICATION_ID, applicationID);
            paramToACA.AppendFormat("&{0}={1}", PaymentConstant.TRANSACTION_ID, transactionID);
            paramToACA.AppendFormat("&{0}={1}", PaymentConstant.USER_MESSAGE, message);
            _logger.Debug("GetRedirectUrlParamToACA " + paramToACA.ToString());
            return paramToACA.ToString();
        }

        private string FormatPostbackData(string responseText, string transactionId) {
            _logger.Debug("FormatPostbackData");
            Hashtable param = ParameterHelper.SplitResponseText(ActionType.FromACA, responseText, '&');

            string success = ParameterHelper.GetParameterByKey(param, PaymentConstant.ACA_TRANS_SUCCESS);
            string message = ParameterHelper.GetParameterByKey(param, PaymentConstant.USER_MESSAGE);

            if (!String.IsNullOrEmpty(message)) {
                message = HttpUtility.UrlEncode(message);
                PaymentHelper.SetDataToCache<string>(transactionId, message, 120);
            }
            _logger.DebugFormat("success={0}&user_message={1}&remittance_id={2}", success, message, transactionId);
            return String.Format("success={0}&user_message={1}&remittance_id={2}", success, message, transactionId);
        }
    }
}
