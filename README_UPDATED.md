# Challenge Update::

1. **server.js** - 
    * Code flow ::
        * Load all the required modules & set variables
        * Custom emailHandler module is added for email related handling
        * Based on env, logging will be enabled
        * First fetch children's JSON data from given URLs then move forward
        * Read the html file , as later on its contents will be modified based on data received from the user. 
        * Setup get & post methods
        * In send method, index.html (form) will be provided
        * In post method, once request is received -> check whether the user is registered & matches the set criteria.
        * Once user credentials matches the set criteria, send mail to santa.
        * Out of the main body, dataProcess() & getAge() methods are added.
        * dataProcess() -> Check whether child is registered or not. if yes, then check whether the uid is matching with credentials or not. If matched then check whether the age is less that 10 or not and send the appropriate action.
        * getAge() -> First normalize the date format to yyyy/mm/dd and calculate the age.

2. **emailHandler.js** - 
    * Code flow :: 
        * First load nodemailer module
        * Set Variables, from & to addresses are fetched from env file.
        * main() -> first set up the ethereal account then only move forward.
        * Settimeout is set with an interval of 15sec. It contains, send email logic.
        * Send email logic -> It acts as an observer, which checks whether any new child data is passed or not. If new data is added then send mail with all the entries.
            - > if there is no data, then observe.
            - > if data is present, send mail and wait for it to complete
            - > if send mail fails then create new ethereal account to rule out any issue and send the pending requests again.
            - > After successfully sending the email, clear the data array. And wait for new data.
        * Only dataPush() is exported to other module as to get the data.   

3. **config.env** - 
    * Variables like NODE_ENV, PORT, EMAIL_FROM, EMAIL_TO are stored.
    * As of now env is set as development, logging is enabled for dev env.
    * From & to addresses are kept here.


