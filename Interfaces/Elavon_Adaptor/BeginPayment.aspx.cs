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

            // Scan: Fixed
            string queryStringLog = System.Security.SecurityElement.Escape(queryString);
            _logger.Debug("Request from ACA " + queryStringLog);

            PaymentHelper.SetDataToCache<string>(PaymentConstant.REDIRECT_URL, redirectURL, 120);

            var moduleCount = new EmseResultObject<string>();
            moduleCount = AccelaRestHandler.GetCartModules(transactionID);

            if (moduleCount.Message != "1.0")
            {
                // Scan: Fixed
                string transactionIDLog = System.Security.SecurityElement.Escape(transactionID);
                _logger.Info(" Transaction ID " + transactionIDLog + " as items from more than one module.");
                PaymentHelper.HandleErrorRedirect("Paying for items from multiple departments is not supported. Please ensure you only have items from one department in your cart.", PaymentConstant.FAILURE_CODE);
                return;
            }

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
                // Scan: Fixed
                string conFeeLog = System.Security.SecurityElement.Escape(conFee);
                string transactionIDLog = System.Security.SecurityElement.Escape(transactionID);
                _logger.DebugFormat("Setting {0}:{1} to cache ", transactionIDLog + "ConvFee", conFeeLog);
            }
            catch (Exception ec) { };
            
            string totalAmount = String.Empty;
            string convFeeMultiplier = ConfigurationManager.AppSettings["ConvFeeMultiplier"];

            if (IsValidCurrency(amount))
            {
                if (ConfigurationManager.AppSettings["AddConvFee"].ToString() == "false")
                    // totalAmount = String.Format("{0:0.00}", Double.Parse(amount) - Double.Parse(conFee));
                    //else
                    totalAmount = String.Format("{0:0.00}", Double.Parse(amount));
                else
                {
                    if (String.IsNullOrEmpty(conFee) || conFee == "0.00" || Double.Parse(conFee) == 0)
                    {
                        Double calculatedConvFee;

                        if (payment_type == "CC")
                        {
                            // CC Fee calulation
                            calculatedConvFee = (Double.Parse(amount) * 0.0154) + 0.11;                            
                        }
                        else
                        {
                            // ACH Fee calulation
                            calculatedConvFee = 0.28;
                        }

                        totalAmount = String.Format("{0:0.00}", Double.Parse(amount) + calculatedConvFee);
                    }                  
                    else
                    {
                        totalAmount = String.Format("{0:0.00}", Double.Parse(amount) + Double.Parse(conFee));
                    }
                }
            }
            else
            {
                PaymentHelper.HandleErrorRedirect("The format of pay amount is wrong", PaymentConstant.FAILURE_CODE);
                return;
            }
            _logger.Debug("Total Amount = " + totalAmount);

            var merchantResult = new EmseResultObject<string>();
            /* Accela - Commented to implement new Merchant Account Functionality */
            //merchantResult.Result = "agency";

            merchantResult = AccelaRestHandler.GetMerchantDetails(transactionID);

            if (!merchantResult.Success)
            {
                // Scan: Fixed
                string merchantResultLog = System.Security.SecurityElement.Escape(merchantResult.Message);
                string transactionIDLog = System.Security.SecurityElement.Escape(transactionID);
                _logger.Debug($"Provided Transaction ID {transactionIDLog} return error {merchantResultLog} from the specified Accela environment.");
                return;
            }

            Accela.ACA.PaymentAdapter.Service.Common.MerchantNode merchantObj = MerchantHelper.GetMerchantByAccountName(merchantResult.Message.ToUpper());
            if (merchantObj == null)
            {
                _logger.Debug($"Provided merchant account name {merchantResult.Message} has no configuration in MerchantMapping.xml.");
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
                // Scan: Fixed
                string tokenLog = System.Security.SecurityElement.Escape(token);
                _logger.DebugFormat("Token received from Converge is {0}", tokenLog);
                // redirect to Converge webpage
                Hashtable urlParams = new Hashtable();
                urlParams.Add("$$TOKEN$$", HttpUtility.UrlEncode(token));
                string url = PaymentHelper.BuildOnlinePaymentURL(urlParams);
                // Scan: Fixed
                string urlLog = System.Security.SecurityElement.Escape(url);
                _logger.Debug("Redirecting to " + urlLog);

                // Scan: Redirect
                if (IsValidConvergeUrl(url))
                {
                    Response.Redirect(url);
                }
            }
            else {
                PaymentHelper.HandleErrorRedirect("Error getting token from Converge", "-1");
            }


        }

        private bool IsValidConvergeUrl(string url)
        {
            if (string.IsNullOrEmpty(url))
            {
                return false;
            }
            else
            {
                Uri myUri = new Uri(url);
                string host = myUri.Host;

                if (host.EndsWith(".convergepay.com"))
                {
                    return true;
                }
                else
                    return false;
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