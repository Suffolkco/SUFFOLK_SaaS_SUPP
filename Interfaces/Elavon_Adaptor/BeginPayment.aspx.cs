using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Configuration;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;
using Accela.ACA.PaymentAdapter;
using Elavon_Adaptor.Connectivity;
using Elavon_Adaptor.DataObjects;

namespace Elavon_Adaptor
{

 
    public partial class BeginPayment : System.Web.UI.Page {

        private static readonly log4net.ILog _logger = LogFactory.Instance.GetLogger(typeof(BeginPayment));
        private long _timeFlag;
        private System.Diagnostics.Stopwatch _watch = null;

        #region Constructors

        /// <summary>
        /// Initializes a new instance of the BeginPayment class.
        /// </summary>
        public BeginPayment()
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

        protected void Page_Load(object sender, EventArgs e) {

            //force tls1.2
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

            // Request from ACA (I)
            Hashtable parameters = ParameterHelper.GetParameterMapping(ActionType.FromACA);
            string queryString = ParameterHelper.GetReqeustParameters();
            string redirectURL = ParameterHelper.GetParameterByKey(parameters, PaymentConstant.REDIRECT_URL);
            string postbackURL = ParameterHelper.GetParameterByKey(parameters, PaymentConstant.POSTBACK_URL);
            string applicationID = ParameterHelper.GetParameterByKey(parameters, PaymentConstant.APPLICATION_ID);
            string transactionID = ParameterHelper.GetParameterByKey(parameters, PaymentConstant.TRANSACTION_ID);
            string agencyCode = ParameterHelper.GetParameterByKey(parameters, PaymentConstant.AGENCY_CODE);
            string userID = ParameterHelper.GetParameterByKey(parameters, PaymentConstant.USER_ID);
            string merchantAccountId = ParameterHelper.GetParameterByKey(parameters, PaymentConstant.MERCHANT_ACCOUNT_ID);
            string payment_type = ParameterHelper.GetParameterByKey(parameters, PaymentConstant.PAYMENT_TYPE);

            _logger.Debug("Finished getting parameters");
            if (String.IsNullOrEmpty(queryString) || String.IsNullOrEmpty(redirectURL) || String.IsNullOrEmpty(transactionID) || String.IsNullOrEmpty(merchantAccountId)) {
                _logger.Debug("Request from ACA (I): The query string is null.");
                 return;
            }

            _logger.Debug("Request from ACA " + queryString);

            // Get the pay amount 
            string amount = ParameterHelper.GetParameterByKey(parameters, PaymentConstant.PAYMENT_AMOUNT);
            if (String.IsNullOrEmpty(amount)) {
                amount = "0.00";
            }
            string conFee = "0.00";
            _logger.DebugFormat("Conv fee switch = {0}", ConfigurationManager.AppSettings["AddConvFee"]);
            try {
                conFee = ParameterHelper.GetParameterByKey(parameters, PaymentConstant.CONVENIENCE_FEE);
                if (String.IsNullOrEmpty(conFee)) {
                    conFee = "0.00";
                }
                PaymentHelper.SetDataToCache<string>(transactionID + "ConvFee", conFee, 120);
                _logger.DebugFormat("Setting {0}:{1} to cache ", transactionID + "ConvFee", conFee);
            }
            catch (Exception ec) { };
            
            string totalAmount = String.Empty;

            if (IsValidCurrency(amount)) {
                if (ConfigurationManager.AppSettings["AddConvFee"].ToString() == "false")
                    totalAmount = String.Format("{0:0.00}", Double.Parse(amount) - Double.Parse(conFee));
                else
                    totalAmount = String.Format("{0:0.00}", Double.Parse(amount));
            }
            else {
                PaymentHelper.HandleErrorRedirect("The format of pay amount is wrong", PaymentConstant.FAILURE_CODE);
                return;
            }
            _logger.Debug("Total Amount = " + totalAmount);

            var merchantResult = new EmseResultObject<string>();
            merchantResult.Result = "agency";
            //var merchantResult = AccelaRestHandler.GetMerchantDetails(merchantAccountId);
            //if (!merchantResult.Success) {
            //    _logger.Debug($"Provided merchant ID {merchantAccountId} return error {merchantResult.Message} from the specified Accela environment.");
            //    return;
            //}
            Accela.ACA.PaymentAdapter.Service.Common.MerchantNode merchantObj = MerchantHelper.GetMerchantByAccountName(merchantResult.Result);
            if (merchantObj == null) {
                _logger.Debug($"Provided merchant account name {merchantResult.Result} with ID {merchantAccountId} has no configuration in MerchantMapping.xml.");
                return;
            }
            _logger.Debug($"Merchant account ID {merchantObj.MerchantID}, user ID {merchantObj.UserID}, PIN {merchantObj.PIN}");

            // get token from Converge
            string errorMessage = String.Empty;
            ConvergeTokenRequest cTokenReq = new ConvergeTokenRequest();
            cTokenReq.ssl_merchant_id = merchantObj.MerchantID;
            cTokenReq.ssl_user_id = merchantObj.UserID;
            cTokenReq.ssl_pin = merchantObj.PIN;
            cTokenReq.ssl_invoice_number = transactionID;
            if (payment_type == "CC") cTokenReq.ssl_transaction_type = "CCSALE";
            else cTokenReq.ssl_transaction_type = "ecspurchase";
            cTokenReq.ssl_amount = totalAmount;              
            string token = HttpHelper.SendTokenPostRequest(PaymentHelper.getHostURL() + "/transaction_token", cTokenReq, _logger);
            if (!String.IsNullOrEmpty(token)) {
                string pattern = @"\.*<!\[CDATA\[(.*?)\]\].*";
                Match matches = Regex.Match(token, pattern, RegexOptions.Singleline);
                if (matches.Success) {
                    token = matches.Groups[1].ToString();
                }
                _logger.DebugFormat("Token received from Converge is {0}", token);

                // redirect to Converge webpage
                Hashtable urlParams = new Hashtable();
                urlParams.Add("$$TOKEN$$", HttpUtility.UrlEncode(token));
                string url = PaymentHelper.BuildOnlinePaymentURL(urlParams);
                _logger.Debug("Redirecting to " + url);
                Response.Redirect(url);
            }
            else {
                PaymentHelper.HandleErrorRedirect("Error getting token from Converge", "-1");
            }


        }

        public String getUTCDateTime() {
            DateTime time = DateTime.Now.ToUniversalTime();
            return time.ToString("yyyy-MM-dd'T'HH:mm:ss'Z'");
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