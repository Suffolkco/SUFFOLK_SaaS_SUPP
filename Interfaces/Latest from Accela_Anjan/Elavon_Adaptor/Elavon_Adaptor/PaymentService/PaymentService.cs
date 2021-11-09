/**
 *  Accela Citizen Access
 *  File: PaymentAdapter.WebService.PaymentGatewayWebService.OnlinePaymentTransactionModel.cs
 * 
 *  Accela, Inc.
 *  Copyright (C): 2009-2011
 * 
 *  Description:
 *   Provide Key-Value pair object.
 * 
 *  Notes:
 * $Id: PaymentAdapter.WebService.PaymentGatewayWebService.OnlinePaymentTransactionModel.cs 130107 2009-07-21 12:23:56Z ACHIEVO\cary.cao $.
 *  Revision History
 *  Date,                  Who,                 What
 */

using InterfaceLib.Common.Service;

namespace Accela.ACA.PaymentAdapter.Service
{
    /// <summary>
    /// the payment service
    /// </summary>
    public class PaymentService
    {
        /// <summary>
        /// logger object.
        /// </summary>
        private static readonly log4net.ILog _logger = LogFactory.Instance.GetLogger(typeof(PaymentService));

        #region Transaction

        /// <summary>
        /// Create payment transaction
        /// </summary>
        /// <param name="transactionModel">transaction model</param>
        /// <returns>the transaction model after commit to database</returns>
        //public PaymentAdapter.WebService.PaymentGatewayWebService.OnlinePaymentTransactionModel CreatePaymentGatewayTrans(PaymentAdapter.WebService.PaymentGatewayWebService.OnlinePaymentTransactionModel transactionModel)
        //{
        //    PaymentAdapter.WebService.PaymentGatewayWebService.PaymentGatewayWebServiceService gateway = WSFactory.Instance.GetPaymentGatewayWebService();

        //    PaymentAdapter.WebService.PaymentGatewayWebService.OnlinePaymentTransactionModel result = null;

        //    try
        //    {
        //        result = gateway.createTrans(transactionModel);
        //    }
        //    catch (System.Exception ex)
        //    {
        //        _logger.Error("Error occurred when creating payment gateway transaction.", ex);
        //    }

        //    return result;
        //}

        public OnlinePaymentTransactionModel CreatePaymentGatewayTrans(OnlinePaymentTransactionModel transactionModel)
        {

            PaymentAPIHelper gateway = new PaymentAPIHelper();

            OnlinePaymentTransactionModel result = null;


            try
            {
                _logger.Info(gateway.Url);
                if (gateway.Url == "")
                {
                    _logger.Error("Error occurred when creating payment gateway transaction.");
                }
                result = gateway.createTrans(transactionModel);
            }
            catch (System.Exception ex)
            {
                //_logger.Error("Error occurred when creating payment gateway transaction.", ex);
            }

            return result;
        }

        /// <summary>
        /// Update payment transaction
        /// </summary>
        /// <param name="transactionModel">transaction model</param>
        //public void UpdatePaymentGatewayTrans(PaymentAdapter.WebService.PaymentGatewayWebService.OnlinePaymentTransactionModel transactionModel)
        //{
        //    PaymentAdapter.WebService.PaymentGatewayWebService.PaymentGatewayWebServiceService gateway = WSFactory.Instance.GetPaymentGatewayWebService();
        //    gateway.updateTrans(transactionModel);
        //}
        public void UpdatePaymentGatewayTrans(OnlinePaymentTransactionModel transactionModel)
        {
            PaymentAPIHelper gateway = new PaymentAPIHelper();
            gateway.updateTrans(transactionModel);
        }

        /// <summary>
        /// Get payment transaction
        /// </summary>
        /// <param name="aaTransId">AA transaction id</param>
        /// <param name="applicationId">application id</param>
        /// <returns>payment transaction model</returns>
        //public PaymentAdapter.WebService.PaymentGatewayWebService.OnlinePaymentTransactionModel GetPaymentGatewayTrans(string aaTransId, string applicationId)
        //{
        //    PaymentAdapter.WebService.PaymentGatewayWebService.PaymentGatewayWebServiceService gateway = WSFactory.Instance.GetPaymentGatewayWebService();
        //    PaymentAdapter.WebService.PaymentGatewayWebService.OnlinePaymentTransactionModel result = gateway.getTransModels(applicationId, aaTransId);

        //    return result;
        //}

        public OnlinePaymentTransactionModel GetPaymentGatewayTrans(string aaTransId, string applicationId)
        {
            PaymentAPIHelper gateway = new PaymentAPIHelper();
            OnlinePaymentTransactionModel result = gateway.getTransModels(applicationId, aaTransId);

            return result;
        }

        #endregion

        #region Trace

        /// <summary>
        /// Create log for payment
        /// </summary>
        /// <param name="logModel">payment log model</param>
        /// <returns>the log model after commit to database</returns>
        //public PaymentAdapter.WebService.PaymentGatewayWebService.OnlinePaymentAudiTrailModel CreatePaymentGatewayLog(PaymentAdapter.WebService.PaymentGatewayWebService.OnlinePaymentAudiTrailModel logModel)
        //{
        //    PaymentAdapter.WebService.PaymentGatewayWebService.PaymentGatewayWebServiceService gateway = WSFactory.Instance.GetPaymentGatewayWebService();
        //    PaymentAdapter.WebService.PaymentGatewayWebService.OnlinePaymentAudiTrailModel result = gateway.createAudiTrail(logModel);
        //    return result;
        //}

        //public OnlinePaymentAudiTrailModel CreatePaymentGatewayLog(OnlinePaymentAudiTrailModel logModel)
        //{
        //    PaymentAPIHelper gateway = new PaymentAPIHelper();
        //    OnlinePaymentAudiTrailModel result = gateway.createAudiTrail(logModel);
        //    return result;
        //}

        /// <summary>
        /// Get payment logs
        /// </summary>
        /// <param name="aaTransId">AA transaction id</param>
        /// <param name="applicationId">application id</param>
        /// <returns>the transaction logs</returns>
        //public PaymentAdapter.WebService.PaymentGatewayWebService.OnlinePaymentAudiTrailModel[] GetPaymentGatewayLogs(string aaTransId, string applicationId)
        //{
        //    PaymentAdapter.WebService.PaymentGatewayWebService.OnlinePaymentAudiTrailModel logModel = new PaymentAdapter.WebService.PaymentGatewayWebService.OnlinePaymentAudiTrailModel();
        //    logModel.aaTransId = aaTransId;
        //    logModel.applicationId = applicationId;

        //    PaymentAdapter.WebService.PaymentGatewayWebService.PaymentGatewayWebServiceService gateway = WSFactory.Instance.GetPaymentGatewayWebService();
        //    PaymentAdapter.WebService.PaymentGatewayWebService.OnlinePaymentAudiTrailModel[] result = gateway.getAudiTrailModels(logModel);
        //    return result;
        //}

        //public OnlinePaymentAudiTrailModel[] GetPaymentGatewayLogs(string aaTransId, string applicationId)
        //{
        //    OnlinePaymentAudiTrailModel logModel = new OnlinePaymentAudiTrailModel();
        //    logModel.aaTransId = aaTransId;
        //    logModel.applicationId = applicationId;

        //    PaymentAPIHelper gateway = new PaymentAPIHelper();
        //    OnlinePaymentAudiTrailModel[] result = gateway.getAudiTrailModels(logModel);
        //    return result;
        //}


        #endregion
    }
}
