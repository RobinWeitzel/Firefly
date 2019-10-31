export default class API {
    /**
    * Creates an instance of the connector
    * @param {string} baseURL The url to your firefly III instance (i.e. https://demo.firefly-iii.org)
    * @param {string} privateToken Your private access token to the firefly III api
    */
    constructor(baseURL, privateToken) {
        this.baseURL = baseURL;
        this.privateToken = privateToken;
    }

    ////// HELPER FUNCTIONS //////
    /**
     * Checks if the HTML status code is ok and returns it
     * Throws an error if it is not
     * @param {Object} res The html response containing the status code
     */
    checkStatus(res) {
        if (res.ok) { // res.status >= 200 && res.status < 300
            return res;
        } else {
            throw new Error(res.statusText);
        }
    }

    /**
     * Executes a GET request to the firelfy III API
     * @param {string} url The url to which the GET request should be sent
     * @returns {Promise} A promise which resolves into a JSON of the body of the requested page
     */
    async get(url) {
        return new Promise((resolve, reject) => {
            fetch(url, {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'Authorization': 'Bearer ' + this.privateToken
                }
            })
                .then(this.checkStatus)
                .then(res => res.json())
                .then(json => resolve(json))
                .catch(err => reject(err));
        });
    }

    /**
     * Executes a POST request to the firelfy III API
     * @param {string} url The url to which the POST request should be sent
     * @param {Object} body The body that should be sent along with the POST request
     * @returns {Promise} A promise which resolves into a JSON of the body of the requested page
     */
    async post(url, body) {
        return new Promise((resolve, reject) => {
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json',
                    'Authorization': 'Bearer ' + this.privateToken
                },
                body: JSON.stringify(body)
            })
                .then(res => res.json())
                .then(json => resolve(json))
                .catch(err => reject(err));
        });
    }

    /**
     * Executes a PUT request to the firelfy III API
     * @param {string} url The url to which the POST request should be sent
     * @param {Object} body The body that should be sent along with the PUT request
     * @returns {Promise} A promise which resolves into a JSON of the body of the requested page
     */
    async put(url, body) {
        return new Promise((resolve, reject) => {
            fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json',
                    'Authorization': 'Bearer ' + this.privateToken
                },
                body: JSON.stringify(body)
            })
                .then(this.checkStatus)
                .then(res => res.json())
                .then(json => resolve(json))
                .catch(err => reject(err));
        });
    }

    /**
     * Constructs a HTML GET query string from a dictionary of parameters
     * @param {Object} params A dictionary containing the parameters
     * @returns {string} The query parameters as a partial URL for get request in form <key>=<value>
     */
    packQuery(params) {
        return Object.keys(params).map(key => `${key}=${params[key]}`).join("&");
    }

    ////// ACCOUNTS //////
    /**
     * This endpoint returns a list of all the accounts owned by the authenticated user.
     * @param {Object} params The query parameters
     * @param {number} params.page Page number. The default pagination is per 50 items.
     * @param {string} params.date A date formatted YYYY-MM-DD. When added to the request, Firefly III will show the account's balance on that day.
     * @param {string} params.type Optional filter on the account type(s) returned. Available values : all, asset, cash, expense, revenue, special, hidden, liability, liabilities, Default account, Cash account, Asset account, Expense account, Revenue account, Initial balance account, Beneficiary account, Import account, Reconciliation account, Loan, Debt, Mortgage, loan, debt, mortgage.
     */
    async getAccounts(params) {
        params = params || {}
        return this.get(`${this.baseURL}/api/v1/accounts?${this.packQuery(params)}`);
    }

    /**
    * Creates a new account. The data required can be submitted as a JSON body or as a list of parameters (in key=value pairs, like a webform).
    * @param {Object} body Contains the information about the new account
    * @param {string} body.name My checking account
    * @param {string} body.type asset
    * @param {string} body.iban GB98MIDL07009312345678
    * @param {string} body.bic BOFAUS3N
    * @param {number} body.account_number 7009312345678
    * @param {number} body.opening_balance -1012.12
    * @param {string} body.opening_balance_date 2018-09-17
    * @param {number} body.virtual_balance 1000
    * @param {number} body.currency_id 12
    * @param {string} body.currency_code EUR
    * @param {number} body.active true
    * @param {number} body.include_net_worth true
    * @param {string} body.account_role defaultAsset
    * @param {string} body.credit_card_type monthlyFull
    * @param {string} body.monthly_payment_date 2018-09-17
    * @param {string} body.liability_type loan
    * @param {number} body.liability_amount 12000
    * @param {string} body.liability_start_date 2017-09-17
    * @param {number} body.interest 3
    * @param {string} body.interest_period monthly
    * @param {string} body.notes Some example notes
    */
    async postAccount(body) {
        return this.post(`${this.baseURL}/api/v1/accounts`, body);
    }

    ////// ATTACHMENTS //////

    /**
     * This endpoint lists all attachments.
     * @param {Object} params The query parameters
     * @param {number} params.page Page number. The default pagination is 50.
     */
    async getAttachments(params) {
        params = params || {}
        return this.get(`${this.baseURL}/api/v1/attachments?${this.packQuery(params)}`);
    }

    /**
     * Creates a new attachment. The data required can be submitted as a JSON body or as a list of parameters. You cannot use this endpoint to upload the actual file data (see below). This endpoint only creates the attachment object.
     * @param {Object} body The new attachment
     * @param {string} body.filename file.pdf
     * @param {string} body.model Bill
     * @param {number} body.model_id 134
     * @param {string} body.title Some PDF file
     * @param {string} body.notes Some notes
     */
    async postAttachment(body) {
        return this.post(`${this.baseURL}/api/v1/attachments`, body);
    }

    /**
     * Use this endpoint to upload (and possible overwrite) the file contents of an attachment. Simply put the entire file in the body as binary data.
     * @param {number} fileSize The size of the file to upload in bytes
     * @param {stream} readStream The file as a byte stream
     */
    async uploadAttachment(attachmentId, readStream) {
        const url = `${this.baseURL}/api/v1/attachments/${attachmentId}/upload`;

        return new Promise((resolve, reject) => {
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'accept': '*/*',
                    'Authorization': 'Bearer ' + this.privateToken
                },
                body: readStream
            })
                .then(res => resolve(res))
                .catch(err => reject(err));
        });
    }


    ////// BUDGETS //////
    /**
     * List all the budgets the user has made. If the start date and end date are submitted as well, the "spent" array will be updated accordingly.
     * @param {Object} params The query parameters
     * @param {number} params.page Page number. The default pagination is per 50 items.
     * @param {string} params.start A date formatted YYYY-MM-DD, to get info on how much the user has spent. You must submit both start and end.
     * @param {string} params.end A date formatted YYYY-MM-DD, to get info on how much the user has spent. You must submit both start and end.
     */
    async getBudgets(params) {
        params = params || {}
        return this.get(`${this.baseURL}/api/v1/budgets?${this.packQuery(params)}`);
    }

    ////// TRANSACTIONS //////

     /**
     * Creates a new transaction. The data required can be submitted as a JSON body or as a list of parameters.
     * @param {Object} body
     * @param {string} body.type withdrawal
     * @param {string} body.description Groceries
     * @param {string} body.date 2018-09-17
     * @param {number} body.piggy_bank_id 0
     * @param {string} body.piggy_bank_name string
     * @param {number} body.bill_id 0
     * @param {string} body.bill_name string
     * @param {string} body.tags some,tags,here
     * @param {string} body.notes Some notes
     * @param {string} body.sepa_cc string
     * @param {string} body.sepa_ct_op string
     * @param {string} body.sepa_ct_id string
     * @param {string} body.sepa_db string
     * @param {string} body.sepa_country string
     * @param {string} body.sepa_ep string
     * @param {string} body.sepa_ci string
     * @param {string} body.sepa_batch_id string
     * @param {string} body.interest_date 2019-03-24
     * @param {string} body.book_date 2019-03-24
     * @param {string} body.process_date 2019-03-24
     * @param {string} body.due_date 2019-03-24
     * @param {string} body.payment_date 2019-03-24
     * @param {string} body.invoice_date 2019-03-24
     * @param {string} body.internal_reference string
     * @param {string} body.bunq_payment_id string
     * @param {string} body.external_id string
     * @param {Array} body.transactions Array of parameters
     * @param {number} body.transactions[i].amount 12.95
     * @param {string} body.transactions[i].description Vegetables
     * @param {number} body.transactions[i].currency_id 12
     * @param {string} body.transactions[i].currency_code EUR
     * @param {number} body.transactions[i].foreign_amount 16.95
     * @param {number} body.transactions[i].foreign_currency_id 15
     * @param {string} body.transactions[i].foreign_currency_code USD
     * @param {number} body.transactions[i].budget_id 4
     * @param {string} body.transactions[i].budget_name Groceries
     * @param {number} body.transactions[i].category_id 43
     * @param {string} body.transactions[i].category_name Groceries
     * @param {number} body.transactions[i].source_id 2
     * @param {string} body.transactions[i].source_name Checking account
     * @param {number} body.transactions[i].destination_id 2
     * @param {string} body.transactions[i].destination_name Buy and Large
     * @param {number} body.transactions[i].reconciled false
     */
    async postTransaction(body) {
        return this.post(`${this.baseURL}/api/v1/transactions`, body);
    }
}