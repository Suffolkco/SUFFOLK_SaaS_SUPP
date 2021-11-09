using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Configuration;
using System.Linq;
using System.Net.Http;
using System.Web;
using Accela.ACA.PaymentAdapter.Service;

namespace InterfaceLib.Common.Service
{
    public class PaymentAPIHelper : APIHelper
    {

        public PaymentAPIHelper()
        {
            log = log4net.LogManager.GetLogger(typeof(PaymentAPIHelper));
        }

        public OnlinePaymentTransactionModel createTrans(OnlinePaymentTransactionModel payment)
        {
            return new OnlinePaymentTransactionModel();
        }

        public OnlinePaymentTransactionModel getTransModels(string applicationId, string aatransid)
        {
            NameValueCollection avConfig = ConfigurationManager.GetSection(@"paymentAdapter") as NameValueCollection;

            TokenAPIHelper tokenHelper = new TokenAPIHelper();
            string token = tokenHelper.Signon(avConfig["av.agency"],
                avConfig["av.username"],
                avConfig["av.password"],
                avConfig["environment"],
                avConfig["clientId"],
                avConfig["clientSecret"]);

            var transModel = new OnlinePaymentTransactionModel();
            var response = Execute<dynamic>(HttpMethod.Get, $"/v4/transactions/{aatransid}", token, null);

            if (response.Key)
            {
                var transaction = response.Value.result[0];
                transModel.paymentAmount = transaction.totalAmount;
            }
            else
            {
                log.Error($"Failed to lookup transaction {aatransid}");
            }
            
            transModel.aaTransId = aatransid;
            transModel.applicationId = applicationId;

            return transModel;
        }

        public OnlinePaymentTransactionModel updateTrans(OnlinePaymentTransactionModel onlinePaymentTransactionModel)
        {
            return new OnlinePaymentTransactionModel();
        }
    }
}