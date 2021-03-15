DECLARE @HAVE_ADAPTER_REC	FLOAT;
DECLARE @SEQ                 FLOAT;			---SEQ for XPOLICY_SEQ
DECLARE @AGENCY_ID			VARCHAR(200);	---agency SERV_PROV_CODE
DECLARE @ADAPTER_NAME		VARCHAR(50);	---Adapter Name
DECLARE @ADAPTER_CONF		VARCHAR(1000);	---Adapter Configuration
DECLARE @GATEWAY_CONF		VARCHAR(1000);	---Gateway Host Configuaration	
DECLARE @MERCHANT_CONF       VARCHAR(1000);	---payment Parameter information 
DECLARE @PAYMENT_CONF		VARCHAR(1000);	---payment info 
BEGIN
  ---init
  ---@TODO: replace me with SERV_PROV_CODE, e.g:'FLAGSTAFF'
  set @AGENCY_ID		='SUFFOLKCO';
  ---@TODO: replace me with the name of your ${customer adapter}_Test, e.g. FirstData_Test
  set @ADAPTER_NAME 	='Elavon_Adapter_Dev';
  ---@TODO: set ADAPTER_CONF value to Adapter=Redirect
  set @ADAPTER_CONF	='Adapter=Redirect';
  ---@TODO: set the GATEWAY_CONF value to your gateway host access information.
  set @GATEWAY_CONF	= 'HostURL=https://acadev.suffolkcountyny.gov/Elavon_Adapter/BeginPayment.aspx'; 
  ---@TODO: replace me with your custom merchant data configuration
  set @MERCHANT_CONF	= 'ApplicationID=1';
  ---@TODO: replace me with your custom gateway data configuration
  set @PAYMENT_CONF	='';
   --end init

	set @HAVE_ADAPTER_REC =0;

	SELECT @HAVE_ADAPTER_REC = count(*)
	FROM XPOLICY
	WHERE SERV_PROV_CODE = @AGENCY_ID
	AND POLICY_NAME = 'PaymentAdapterSec'
	AND LEVEL_TYPE = 'Adapter'
	AND LEVEL_DATA = @ADAPTER_NAME;
	IF (@HAVE_ADAPTER_REC <= 0)
	BEGIN
		-- insert Adapter record
		SELECT @SEQ=T.LAST_NUMBER      
		FROM AA_SYS_SEQ T
		WHERE T.SEQUENCE_NAME = 'XPOLICY_SEQ'

		SET @SEQ = @SEQ + 1;

		INSERT INTO XPOLICY
			(SERV_PROV_CODE, POLICY_SEQ, POLICY_NAME, LEVEL_TYPE, LEVEL_DATA, DATA1, RIGHT_GRANTED,
			STATUS, REC_DATE, REC_FUL_NAM, REC_STATUS, MENUITEM_CODE, DATA2, DATA3, DATA4, MENU_LEVEL,
			DATA5, RES_ID)
			VALUES
			(AGENCY_ID, SEQ, 'PaymentAdapterSec', 'Adapter', ADAPTER_NAME, ADAPTER_CONF, 'F',
			'A', SYSDATE, 'ADMIN', 'A', '', GATEWAY_CONF , '', MERCHANT_CONF, '',
			'', '');

	UPDATE AA_SYS_SEQ SET LAST_NUMBER = @SEQ WHERE SEQUENCE_NAME = 'XPOLICY_SEQ'
	END
	
	UPDATE XPOLICY
	SET 
		DATA1=@ADAPTER_CONF,
		DATA2=@GATEWAY_CONF ,
		DATA3='',
		DATA4=@MERCHANT_CONF,
		REC_DATE=GETDATE(),
		REC_FUL_NAM='ADMIN'
	WHERE SERV_PROV_CODE = @AGENCY_ID
	AND POLICY_NAME = 'PaymentAdapterSec'
	AND LEVEL_TYPE = 'Adapter'
	AND LEVEL_DATA = @ADAPTER_NAME;
	
	--commit
END

