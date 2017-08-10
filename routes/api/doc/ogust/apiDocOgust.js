/* API DOCUMENTATION for apidoc.js - Ogust */

/**
 * @api {get} /api/ogust/token Get ogust token
 * @apiVersion 1.0.0
 * @apiPermission User
 * @apiName get
 * @apiGroup Ogust
 *
 * @apiHeader {String} x-access-token User access-token from Alenvi
 *
 * @apiSuccess {Boolean} success Return true on success.
 * @apiSuccess {String} message Human readable message to display for clients.
 * @apiSuccess {Object} data List of all users.
 * @apiSuccess {String} data.status Response status from Ogust.
 * @apiSuccess {String} data.token Token from Ogust.
 * @apiSuccess {String} data.expireDate Expiration date of token from Ogust.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *         "success": true,
 *         "message": "Token Ogust reçu avec succès.",
 *         "data": {
 *             "status": "OK",
 *             "token": "94KYPZ83P260W871H1793FCSIZF118KZ7F592N14",
 *             "expireDate": "2017-08-10T14:12:00+02:00"
 *         }
 *     }
 *
 * @apiUse OgustGetTokenFailedError
 */


/**
 * @api {get} /api/ogust/employees Retrieve all employees from Ogust
 * @apiVersion 1.0.0
 * @apiPermission Ogust
 * @apiName getAll
 * @apiGroup Ogust
 *
 * @apiHeader {String} x-ogust-token User token from Ogust
 *
 * @apiParam {String} status="A" Employee status
 * @apiParam {String} nature="S" Employee nature
 * @apiParam {Number} nbperpage=50 Number of records per page
 * @apiParam {Number} pagenum=1 Page number
 *
 * @apiSuccess {Boolean} success Return true on success.
 * @apiSuccess {String} message Human readable message to display for clients.
 * @apiSuccess {Object} data List of all employees from Ogust.
 * @apiSuccess {Object} data.users Object containing users information.
 * @apiSuccess {String} data.users.status Response status from Ogust.
 * @apiSuccess {Object} data.users.array_employee Object containing pagination options and list of all employees
 * @apiSuccess {Object} data.users.array_employee.pagination List of the paginations options
 * @apiSuccess {String} data.users.array_employee.pagination.count Total Number of records
 * @apiSuccess {String} data.users.array_employee.pagination.nbperpage Number of records per page
 * @apiSuccess {String} data.users.array_employee.pagination.pageNum Page number
 * @apiSuccess {Object} data.users.array_employee.result Object containing all the information about employees
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *         "success": true,
 *         "message": "Utilisateurs trouvés avec succès.",
 *         "data": {
 *             "users": {
 *                 "status": "OK",
 *                 "array_employee": {
 *                     "pagination": {
 *                         "count": 16,
 *                         "nbperpage": 50,
 *                         "pagenum": 1
 *                     },
 *                     "result": {
 *                         "0": {
 *                             "id_employee": "903251483",
 *                             "mode": "0",
 *                             "number": "GY23049",
 *                             "nature": "S",
 *                             "create_date": "201606201116",
 *                             "creator": "036270229",
 *                             "title": "Mme",
 *                             "last_name": "Barker",
 *                             "maiden_name": null,
 *                             "first_name": "Lou",
 *                             "language": "fr-FR",
 *                             "rms_number": null,
 *                             "email": "lou.barker@gmail.com",
 *                             "landline": "",
 *                             "mobile_phone": "0601585520",
 *                             "fax": "",
 *                             "skype_id": "732902502001425",
 *                             "method_of_payment": "3580",
 *                             "accounting_account": null,
 *                             "status": "G",
 *                             "sector": "1m*",
 *                             "date_of_birth": "19800214",
 *                             "place_of_birth": "Paris",
 *                             "state_of_birth": "75",
 *                             "country_of_birth": "FR",
 *                             "nationality": "FR",
 *                             "family_situation": null,
 *                             "transport_pass": "O",
 *                             "transport_pass_cost": "50.30",
 *                             "driving_license": "N",
 *                             "means_of_transport": null,
 *                             "comment": "",
 *                             "intra_community_VAT": null,
 *                             "company_registration_number": null,
 *                             "legal_status": null,
 *                             "activity": null,
 *                             "manager": "522620130",
 *                             "social_insurance_number": "340026873502452",
 *                             "main_address": {
 *                                 "id_address": "370212493",
 *                                 "line": "117 RUE SAINT MICHEL",
 *                                 "supplement": "",
 *                                 "zip": "75006",
 *                                 "city": "PARIS",
 *                                 "country": "FR",
 *                                 "type": "Azerty",
 *                                 "id_link": "4515613993074688",
 *                                 "third_party": "1"
 *                             },
 *                             "billing_address": {},
 *                             "secondary_address": {},
 *                             "picture": "http://te.uy/bobsala",
 *                             "bank_information": {
 *                                 "0": {
 *                                     "id_bankinfo": "4794984429518848",
 *                                     "id_tiers": "4904318450794496",
 *                                     "holder": "Lou Barker",
 *                                     "address": {
 *                                         "id_address": "1000092570429249",
 *                                         "line": "117 RUE SAINT MICHEL",
 *                                         "supplement": "",
 *                                         "zip": "75006",
 *                                         "city": "PARIS",
 *                                         "country": "FR",
 *                                         "type": "Azerty",
 *                                         "id_link": "1081677124206592",
 *                                         "third_party": "j"
 *                                     },
 *                                     "location": null,
 *                                     "name": null,
 *                                     "iban_number": "FR8830125976059904",
 *                                     "bic_number": "TNPDFRPXXX"
 *                                 }
 *                             },
 *                             "sepa_information": {}
 *                         },
 *                         "1": {
 *                             "id_employee": "903251483",
 *                             "mode": "0",
 *                             "number": "GY23049",
 *                             "nature": "S",
 *                             "create_date": "201606201116",
 *                             "creator": "036270229",
 *                             "title": "Mme",
 *                             "last_name": "Barker",
 *                             "maiden_name": null,
 *                             "first_name": "Lou",
 *                             "language": "fr-FR",
 *                             "rms_number": null,
 *                             "email": "lou.barker@gmail.com",
 *                             "landline": "",
 *                             "mobile_phone": "0601585520",
 *                             "fax": "",
 *                             "skype_id": "732902502001425",
 *                             "method_of_payment": "3580",
 *                             "accounting_account": null,
 *                             "status": "G",
 *                             "sector": "1m*",
 *                             "date_of_birth": "19800214",
 *                             "place_of_birth": "Paris",
 *                             "state_of_birth": "75",
 *                             "country_of_birth": "FR",
 *                             "nationality": "FR",
 *                             "family_situation": null,
 *                             "transport_pass": "O",
 *                             "transport_pass_cost": "50.30",
 *                             "driving_license": "N",
 *                             "means_of_transport": null,
 *                             "comment": "",
 *                             "intra_community_VAT": null,
 *                             "company_registration_number": null,
 *                             "legal_status": null,
 *                             "activity": null,
 *                             "manager": "522620130",
 *                             "social_insurance_number": "340026873502452",
 *                             "main_address": {
 *                                 "id_address": "370212493",
 *                                 "line": "117 RUE SAINT MICHEL",
 *                                 "supplement": "",
 *                                 "zip": "75006",
 *                                 "city": "PARIS",
 *                                 "country": "FR",
 *                                 "type": "Azerty",
 *                                 "id_link": "4515613993074688",
 *                                 "third_party": "1"
 *                             },
 *                             "billing_address": {},
 *                             "secondary_address": {},
 *                             "picture": "http://te.uy/bobsala",
 *                             "bank_information": {
 *                                 "0": {
 *                                     "id_bankinfo": "4794984429518848",
 *                                     "id_tiers": "4904318450794496",
 *                                     "holder": "Lou Barker",
 *                                     "address": {
 *                                         "id_address": "1000092570429249",
 *                                         "line": "117 RUE SAINT MICHEL",
 *                                         "supplement": "",
 *                                         "zip": "75006",
 *                                         "city": "PARIS",
 *                                         "country": "FR",
 *                                         "type": "Azerty",
 *                                         "id_link": "1081677124206592",
 *                                         "third_party": "j"
 *                                     },
 *                                     "location": null,
 *                                     "name": null,
 *                                     "iban_number": "FR8830125976059904",
 *                                     "bic_number": "TNPDFRPXXX"
 *                                 }
 *                             },
 *                             "sepa_information": {}
 *                         }
 *                     }
 *                 }
 *             }
 *         }
 *      }
 *
 * @apiUse UserShowAllNotFoundError
 * @apiUse UnexpectedBehaviorError
 */

/**
 * @api {get} /api/ogust/employees/sector/:sector Retrieve all employees from Ogust by sector
 * @apiVersion 1.0.0
 * @apiPermission Ogust
 * @apiName getAllBySector
 * @apiGroup Ogust
 *
 * @apiHeader {String} x-ogust-token User token from Ogust
 *
 * @apiParam {String} sector Ogust sector
 * @apiParam {String} [status="A"] Employee status
 * @apiParam {String} [nature="S"] Employee nature
 * @apiParam {String} [nbperpage="50"] Number of records per page
 * @apiParam {string} [pagenum="1"] Page number
 *
 * @apiSuccess {Boolean} success Return true on success.
 * @apiSuccess {String} message Human readable message to display for clients.
 * @apiSuccess {Object} data List of all employees from Ogust.
 * @apiSuccess {Object} data.users Object containing users information.
 * @apiSuccess {String} data.users.status Response status from Ogust.
 * @apiSuccess {Object} data.users.array_employee Object containing pagination options and list of all employees.
 * @apiSuccess {Object} data.users.array_employee.pagination List of the paginations options.
 * @apiSuccess {Number} data.users.array_employee.pagination.count Total Number of records.
 * @apiSuccess {Number} data.users.array_employee.pagination.nbperpage Number of records per page.
 * @apiSuccess {Number} data.users.array_employee.pagination.pageNum Page number.
 * @apiSuccess {Object} data.users.array_employee.result Object containing all the information about employees.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *         "success": true,
 *         "message": "Utilisateurs trouvés avec succès.",
 *         "data": {
 *             "users": {
 *                 "status": "OK",
 *                 "array_employee": {
 *                     "pagination": {
 *                         "count": 16,
 *                         "nbperpage": 50,
 *                         "pagenum": 1
 *                     },
 *                     "result": {
 *                         "0": {
 *                             "id_employee": "903251483",
 *                             "mode": "0",
 *                             "number": "GY23049",
 *                             "nature": "S",
 *                             "create_date": "201606201116",
 *                             "creator": "036270229",
 *                             "title": "Mme",
 *                             "last_name": "Barker",
 *                             "maiden_name": null,
 *                             "first_name": "Lou",
 *                             "language": "fr-FR",
 *                             "rms_number": null,
 *                             "email": "lou.barker@gmail.com",
 *                             "landline": "",
 *                             "mobile_phone": "0601585520",
 *                             "fax": "",
 *                             "skype_id": "732902502001425",
 *                             "method_of_payment": "3580",
 *                             "accounting_account": null,
 *                             "status": "G",
 *                             "sector": "1m*",
 *                             "date_of_birth": "19800214",
 *                             "place_of_birth": "Paris",
 *                             "state_of_birth": "75",
 *                             "country_of_birth": "FR",
 *                             "nationality": "FR",
 *                             "family_situation": null,
 *                             "transport_pass": "O",
 *                             "transport_pass_cost": "50.30",
 *                             "driving_license": "N",
 *                             "means_of_transport": null,
 *                             "comment": "",
 *                             "intra_community_VAT": null,
 *                             "company_registration_number": null,
 *                             "legal_status": null,
 *                             "activity": null,
 *                             "manager": "522620130",
 *                             "social_insurance_number": "340026873502452",
 *                             "main_address": {
 *                                 "id_address": "370212493",
 *                                 "line": "117 RUE SAINT MICHEL",
 *                                 "supplement": "",
 *                                 "zip": "75006",
 *                                 "city": "PARIS",
 *                                 "country": "FR",
 *                                 "type": "Azerty",
 *                                 "id_link": "4515613993074688",
 *                                 "third_party": "1"
 *                             },
 *                             "billing_address": {},
 *                             "secondary_address": {},
 *                             "picture": "http://te.uy/bobsala",
 *                             "bank_information": {
 *                                 "0": {
 *                                     "id_bankinfo": "4794984429518848",
 *                                     "id_tiers": "4904318450794496",
 *                                     "holder": "Lou Barker",
 *                                     "address": {
 *                                         "id_address": "1000092570429249",
 *                                         "line": "117 RUE SAINT MICHEL",
 *                                         "supplement": "",
 *                                         "zip": "75006",
 *                                         "city": "PARIS",
 *                                         "country": "FR",
 *                                         "type": "Azerty",
 *                                         "id_link": "1081677124206592",
 *                                         "third_party": "j"
 *                                     },
 *                                     "location": null,
 *                                     "name": null,
 *                                     "iban_number": "FR8830125976059904",
 *                                     "bic_number": "TNPDFRPXXX"
 *                                 }
 *                             },
 *                             "sepa_information": {}
 *                         },
 *                         "1": {
 *                             "id_employee": "903251483",
 *                             "mode": "0",
 *                             "number": "GY23049",
 *                             "nature": "S",
 *                             "create_date": "201606201116",
 *                             "creator": "036270229",
 *                             "title": "Mme",
 *                             "last_name": "Barker",
 *                             "maiden_name": null,
 *                             "first_name": "Lou",
 *                             "language": "fr-FR",
 *                             "rms_number": null,
 *                             "email": "lou.barker@gmail.com",
 *                             "landline": "",
 *                             "mobile_phone": "0601585520",
 *                             "fax": "",
 *                             "skype_id": "732902502001425",
 *                             "method_of_payment": "3580",
 *                             "accounting_account": null,
 *                             "status": "G",
 *                             "sector": "1m*",
 *                             "date_of_birth": "19800214",
 *                             "place_of_birth": "Paris",
 *                             "state_of_birth": "75",
 *                             "country_of_birth": "FR",
 *                             "nationality": "FR",
 *                             "family_situation": null,
 *                             "transport_pass": "O",
 *                             "transport_pass_cost": "50.30",
 *                             "driving_license": "N",
 *                             "means_of_transport": null,
 *                             "comment": "",
 *                             "intra_community_VAT": null,
 *                             "company_registration_number": null,
 *                             "legal_status": null,
 *                             "activity": null,
 *                             "manager": "522620130",
 *                             "social_insurance_number": "340026873502452",
 *                             "main_address": {
 *                                 "id_address": "370212493",
 *                                 "line": "117 RUE SAINT MICHEL",
 *                                 "supplement": "",
 *                                 "zip": "75006",
 *                                 "city": "PARIS",
 *                                 "country": "FR",
 *                                 "type": "Azerty",
 *                                 "id_link": "4515613993074688",
 *                                 "third_party": "1"
 *                             },
 *                             "billing_address": {},
 *                             "secondary_address": {},
 *                             "picture": "http://te.uy/bobsala",
 *                             "bank_information": {
 *                                 "0": {
 *                                     "id_bankinfo": "4794984429518848",
 *                                     "id_tiers": "4904318450794496",
 *                                     "holder": "Lou Barker",
 *                                     "address": {
 *                                         "id_address": "1000092570429249",
 *                                         "line": "117 RUE SAINT MICHEL",
 *                                         "supplement": "",
 *                                         "zip": "75006",
 *                                         "city": "PARIS",
 *                                         "country": "FR",
 *                                         "type": "Azerty",
 *                                         "id_link": "1081677124206592",
 *                                         "third_party": "j"
 *                                     },
 *                                     "location": null,
 *                                     "name": null,
 *                                     "iban_number": "FR8830125976059904",
 *                                     "bic_number": "TNPDFRPXXX"
 *                                 }
 *                             },
 *                             "sepa_information": {}
 *                         }
 *                     }
 *                 }
 *             }
 *         }
 *      }
 *
 * @apiUse MissingParametersError
 * @apiUse UserShowAllNotFoundError
 * @apiUse UnexpectedBehaviorError
 */

/**
 * @api {get} /api/ogust/employees/:id Retrieve an employee by its id from Ogust
 * @apiVersion 1.0.0
 * @apiPermission Ogust
 * @apiName getById
 * @apiGroup Ogust
 *
 * @apiHeader {String} x-ogust-token User token from Ogust
 *
 * @apiParam {String} id Unique id of the employee
 * @apiParam {String} status="A" Employee status
 *
 * @apiSuccess {Boolean} success Return true on success.
 * @apiSuccess {String} message Human readable message to display for clients.
 * @apiSuccess {Object} data Employee info from Ogust.
 * @apiSuccess {Object} data.user
 * @apiSuccess {String} data.user.status Response status from Ogust.
 * @apiSuccess {Object} data.user.employee Object containing employee information.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *         "success": true,
 *         "message": "Utilisateur trouvé avec succès.",
 *         "data": {
 *             "user": {
 *                 "status": "OK",
 *                 "employee": {
 *                     "id_employee": "5289342947819520",
 *                     "mode": "0",
 *                     "number": "4G80705",
 *                     "nature": "S",
 *                     "create_date": "2061-12-16T19:13:26.202Z",
 *                     "creator": "3737525420032000",
 *                     "title": "M.",
 *                     "last_name": "Jackson",
 *                     "maiden_name": null,
 *                     "first_name": "Daniel",
 *                     "language": "fr-FR",
 *                     "rms_number": null,
 *                     "email": "hu@gokim.jp",
 *                     "landline": "",
 *                     "mobile_phone": "0634567809",
 *                     "fax": "",
 *                     "skype_id": "3260374914695168",
 *                     "method_of_payment": "9310",
 *                     "accounting_account": null,
 *                     "status": "A",
 *                     "sector": "1m*",
 *                     "date_of_birth": "19650721",
 *                     "place_of_birth": "Hanvuvop",
 *                     "state_of_birth": "99",
 *                     "country_of_birth": "DV",
 *                     "nationality": "DV",
 *                     "family_situation": null,
 *                     "transport_pass": "O",
 *                     "transport_pass_cost": "58.50",
 *                     "driving_license": "N",
 *                     "means_of_transport": null,
 *                     "comment": "",
 *                     "intra_community_VAT": null,
 *                     "company_registration_number": null,
 *                     "legal_status": null,
 *                     "activity": null,
 *                     "manager": "7084649138356224",
 *                     "social_insurance_number": "7780013447315456",
 *                     "main_address": {
 *                         "id_address": "3354150486147072",
 *                         "line": "467 Cuzip Loop",
 *                         "supplement": "",
 *                         "zip": "75009",
 *                         "city": "PARIS",
 *                         "country": "FR",
 *                         "type": "Azerty",
 *                         "id_link": "2386597918015488",
 *                         "third_party": "I"
 *                     },
 *                     "billing_address": {},
 *                     "secondary_address": {},
 *                     "picture": "http://nukes.lt/guzfuf",
 *                     "bank_information": {
 *                         "0": {
 *                             "id_bankinfo": "7640541558734848",
 *                             "id_tiers": "5273630768365568",
 *                             "holder": "Susie Aguilar",
 *                             "address": {
 *                                 "id_address": "249679105",
 *                                 "line": "467 Cuzip Loop",
 *                                 "supplement": "",
 *                                 "zip": "75009",
 *                                 "city": "PARIS",
 *                                 "country": "FR",
 *                                 "type": "Azerty",
 *                                 "id_link": "2386597918015488",
 *                                 "third_party": "I"
 *                             },
 *                             "location": null,
 *                             "name": null,
 *                             "iban_number": "FR4703480956583936",
 *                             "bic_number": "FREDFRDDXXX"
 *                         }
 *                     },
 *                     "sepa_information": {}
 *                 }
 *             }
 *         }
 *     }
 *
 * @apiUse UserNotFoundError
 * @apiUse UnexpectedBehaviorError
 */

/**
 * @api {get} /api/ogust/employees/:id/services Retrieve services by employee
 * @apiVersion 1.0.0
 * @apiPermission Ogust
 * @apiName getEmployeeServices
 * @apiGroup Ogust
 *
 * @apiHeader {String} x-ogust-token User token from Ogust
 *
 * @apiParam {String} id Unique id of the employee
 * @apiParam {String} isRange="false" If true will retrieve services by range (slotToAdd, slotToSub and intervalType need to be set then)
 * @apiParam {String} isDate="false" If true will retrieve services by date (startDate and endDate need to be set then)
 * @apiParam {String} slotToSub Offset needed when isRange is true
 * @apiParam {String} slotToAdd Offset needed when isRange is true
 * @apiParam {String} intervalType Type of interval (weeks, days) needed when isRange is true
 * @apiParam {String} [startDate] Start date needed when isDate is true
 * @apiParam {String} [endDate] End date needed when isDate is true
 * @apiParam {String} [status="@!=|N"] Status of the service
 * @apiParam {String} [type="I"] Type of the service
 * @apiParam {String} [nbPerPage="100"] Number of records per page
 * @apiParam {String} [pageNum="1"] Page number
 *
 * @apiSuccess {Boolean} success Return true on success.
 * @apiSuccess {String} message Human readable message to display for clients.
 * @apiSuccess {Object} data
 * @apiSuccess {Object} data.servicesRaw List of services by employee.
 * @apiSuccess {String} data.servicesRaw.status Response status from Ogust.
 * @apiSuccess {Object} data.servicesRaw.array_service Object containing pagination options and list of services for an employee.
 * @apiSuccess {Object} data.servicesRaw.array_service.pagination List of the paginations options.
 * @apiSuccess {Number} data.servicesRaw.array_service.pagination.count Total Number of records.
 * @apiSuccess {String} data.servicesRaw.array_service.pagination.nbperpage Number of records per page.
 * @apiSuccess {String} data.servicesRaw.array_service.pagination.pageNum Page number.
 * @apiSuccess {Object} data.servicesRaw.array_service.result Object containing all the services about an employee within range or date specified.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *         "success": true,
 *         "message": "Services Ogust reçus avec succès.",
 *         "data": {
 *             "servicesRaw": {
 *                 "status": "OK",
 *                 "array_service": {
 *                     "pagination": {
 *                         "count": 23,
 *                         "nbperpage": "100",
 *                         "pagenum": "1"
 *                     },
 *                     "result": {
 *                         "0": {
 *                             "id_service": "471894706",
 *                             "rates": "0",
 *                             "id_employee": "149720105",
 *                             "id_customer": "386180649",
 *                             "product_level": "212960568",
 *                             "start_date": "201708050930",
 *                             "end_date": "201708051230",
 *                             "status": "R",
 *                             "id_repetition": "0",
 *                             "type": "I",
 *                             "comment": "",
 *                             "alert": "N",
 *                             "invoice": "0",
 *                             "distance": "0.00",
 *                             "distance_charged": "N",
 *                             "journey_time": "0",
 *                             "fees_amount": "0.00",
 *                             "fees_amount_charged": "N",
 *                             "mode": "P",
 *                             "pay_slip": "0",
 *                             "contract": "0",
 *                             "billing_amount": "1.00",
 *                             "billing_amount_unit": "H",
 *                             "validate_date_C": null,
 *                             "validate_comment_C": null,
 *                             "validate_date_I": null,
 *                             "validate_comment_I": null,
 *                             "insert_service": "Gestionnaire",
 *                             "initiative": "Intervenant"
 *                         },
 *                         "1": {
 *                             "id_service": "471894706",
 *                             "rates": "0",
 *                             "id_employee": "149720105",
 *                             "id_customer": "386180649",
 *                             "product_level": "212960568",
 *                             "start_date": "201708050930",
 *                             "end_date": "201708051230",
 *                             "status": "R",
 *                             "id_repetition": "0",
 *                             "type": "I",
 *                             "comment": "",
 *                             "alert": "N",
 *                             "invoice": "0",
 *                             "distance": "0.00",
 *                             "distance_charged": "N",
 *                             "journey_time": "0",
 *                             "fees_amount": "0.00",
 *                             "fees_amount_charged": "N",
 *                             "mode": "P",
 *                             "pay_slip": "0",
 *                             "contract": "0",
 *                             "billing_amount": "1.00",
 *                             "billing_amount_unit": "H",
 *                             "validate_date_C": null,
 *                             "validate_comment_C": null,
 *                             "validate_date_I": null,
 *                             "validate_comment_I": null,
 *                             "insert_service": "Gestionnaire",
 *                             "initiative": "Intervenant"
 *                         },
 *                     }
 *                 }
 *             }
 *         }
 *      }
 *
 * @apiUse MissingParametersError
 * @apiUse ServiceNotFoundError
 * @apiUse UnexpectedBehaviorError
 */
