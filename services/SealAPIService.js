export default class SealAPI {

    constructor ($axios, $store) {
        this.axios = $axios ;
        this.store = $store ;
    }

    dblog(activity, mesg, appId) {
        this.axios.post("/fhir-app/api/v1/dblog?aid=" + appId, { "act": activity, "mesg" : mesg}) ;
    }
    
    feedback(data, patientId, appId) {
        return this.axios
            .post("/fhir-app/api/v1/feedback?aid=" + appId + "&pid=" + patientId, data)
            .then( (response) => { 
                return response.data ;
            }) ;
    }

    sessinfo(appId) {
        return this.axios({
            method: 'get',
            url: "/fhir-app/api/v1/sessInfo?aid=" + appId
        }).then((response) => {            
            return response.data ;
        }) ;        
    }

    userroles(appId) {
        return this.axios({
            method: 'get',
            url: "/fhir-app/api/v1/roles?aid=" + appId
        }).then((response) => {            
            return response.data ;
        }) ;                
    }

    updatefav(app, appId) {
        return this.axios
            .post("/fhir-app/api/v2/app/fav?aid=" + appId, app)
            .then((response) => {            
                return response.data ;
            }) ;                        
    }
    /**
     * returns patient with names, address, epicPatientId, MRN, seal conditions etc.
     * 
     * @param {app id} appId 
     * @returns 
     */
    patient(appId) {
        /*
        var patient = 
        {
          "firstName" : "Casey C",
          "lastName" : "Willow",
          "fullName" : "Casey C Willow",
          "gender" : "Male",
          "birthDate" : "1950-10-30",
          "street" : "134 Elm Street",
          "city" : "Madison",
          "stateCode" : "WI",
          "postalCode" : "53706",
          "countryCode" : "US",
          "epicPatientId" : "Z5089",
          "mrn" : "203139",
          "cmeds" : [ {
            "seal_medication_id" : 2,
            "med_name" : "srini: test med",
            "syndromes" : "",
            "med_periods" : [ {
              "ptype" : "Inpatient",
              "end_date" : "07/06/2021",
              "start_date" : "07/14/2021"
            } ],
            "med_note" : "sajkhjkashdkaj\nlkhklhkhkhkj",
            "created_by_name" : "User, SHC",
            "updated_by_name" : "User, SHC",
            "created_dttm_str" : "07/02/2021 03:46:27 PM",
            "updated_dttm_str" : "07/02/2021 04:24:28 PM"
          } ],
          "seal_conditions" : [ ]
        } ;
        var sc = {} ;
        sc.epic_conditions = patient.seal_conditions.filter(cond => cond.condition_source == 'EPIC') ;
        sc.user_conditions = patient.seal_conditions.filter(cond => cond.condition_source == 'USER') ;
        patient.seal_conditions = sc ;
        return patient ;
        */
        return this.axios({
            method: 'get',
            url: "/fhir-app/medreview/api/v2/patient?pid=" + this.store.state.patientId + "&aid=" + appId
        }).then((response) => {
            var patient = response.data ;
            var sc = {} ;
            sc.epic_conditions = [] ;
            sc.user_conditions = [] ;
            patient.seal_conditions.forEach(function(cond) {
                if (cond.condition_source == 'EPIC')
                    sc.epic_conditions.push(cond) ;
                else
                    sc.user_conditions.push(cond) ;
            }) ;
            patient.seal_conditions = sc ;
            return patient ;
        }) ;
                        
    }

    /**
     * 
     * @param {start date of the order in yyyy-mm-dd format} start_date 
     * @param {end date of the order in yyyy-mm-dd format} end_date 
     * @param {syndrome code for highlighting - not required} syndrome 
     * @param {pass nothing for first call, and pass the nexturl from the returned json here} nextUrl 
     * @param {application id - required} appId 
     * @returns Medication Orders
     */
    medicationData(start_date, end_date, syndrome, nextUrl, appId) {
        
        var url = "/fhir-app/medreview/api/v2/med?start_date=" + start_date +
            "&end_date=" + end_date + "&syndrome=" + syndrome + "&pid=" + this.store.state.patientId + "&aid=" + appId ;
        
        if (nextUrl && nextUrl !== '') {
            url = "/fhir-app/medreview/api/v2/med?pid=" + this.store.state.patientId + "&aid=" + appId + 
                "&start_date=" + start_date + "&end_date=" + end_date + + "&syndrome=" + syndrome + 
                "&next=" + encodeURIComponent(nextUrl) ;
        }

        return this.axios({
            method: 'get',
            url: url
        }).then((response) => {            
            return response.data ;
        }) ;

    }

    /**
     * Returns list of Inpatient Encounters
     * 
     * @param {start date} start_date 
     * @param {end date} end_date 
     * @returns Inpatient Encounters
     */
    encounters(start_date, end_date, nextUrl, appId) {    

        var url = "/fhir-app/medreview/api/v2/enc?pid=" + this.store.state.patientId + "&aid=" + appId +
            "&start_date=" + start_date + "&end_date=" + end_date + "&enc_type=inpatient";

        if (nextUrl && nextUrl !== '') {
            url = "/fhir-app/medreview/api/v2/enc?pid=" + this.store.state.patientId + "&aid=" + appId + 
                    "&start_date=" + start_date + "&end_date=" + end_date + "&enc_type=inpatient" + "&next=" + encodeURIComponent(nextUrl) ;
        }

        return this.axios({
            method: 'get',
            url: url
        }).then((response) => {            
            return response.data.data ;
        })        
    }

    /**
     * Returns list of Surgical Encounters
     * 
     * @param {start date} start_date 
     * @param {end date} end_date 
     * @returns Surgical Encounters
     */
     surgical_encounters(start_date, end_date, nextUrl, appId) {    

        var url = "/fhir-app/medreview/api/v2/enc?pid=" + this.store.state.patientId + "&aid=" + appId +
            "&start_date=" + start_date + "&end_date=" + end_date + "&enc_type=surgery" ;

        if (nextUrl && nextUrl !== '') {
            url = "/fhir-app/medreview/api/v2/enc?pid=" + this.store.state.patientId + "&aid=" + appId + 
                    "&start_date=" + start_date + "&end_date=" + end_date + "&enc_type=surgery" + "&next=" + encodeURIComponent(nextUrl) ;
        }

        return this.axios({
            method: 'get',
            url: url
        }).then((response) => {            
            return response.data.data ;
        })        
    }


    /**
     * 
     * @param {Json to be sent to the epic webserice all} wsjson 
     * @param {app id} appId 
     * @returns array of promises of webservice calls for each csn
     */
    mardata(wsjson, appId) {
        
        var wscalls = [] ;

        Object.keys(wsjson).forEach(csn => {            
            if (wsjson[csn].OrderIDs.length > 0) {  // skip if there are no orders
                wscalls.push(this.axios
                    .post("/fhir-app/medreview/api/v2/mardata?pid=" + this.store.state.patientId + "&aid=" + appId, wsjson[csn])) ;
            }
        }) ;
        
        return Promise.all(wscalls) ;        
    }

    obsData(category, start_date, end_date, syndrome, nextUrl, appId) {
        
        var url = "/fhir-app/medreview/api/v2/obs?category=" + category + "&start_date=" + start_date +
            "&end_date=" + end_date + "&syndrome=" + syndrome + "&pid=" + this.store.state.patientId + "&aid=" + appId ;
        
        if (nextUrl && nextUrl !== '') {
            url = "/fhir-app/medreview/api/v2/obs?pid=" + this.store.state.patientId + "&aid=" + appId + 
                "&category=" + category + "&start_date=" + start_date + "&end_date=" + end_date + "&syndrome=" + syndrome +
                "&next=" + encodeURIComponent(nextUrl) ;
        }

        return this.axios({
            method: 'get',
            url: url
        }).then((response) => {            
            return response.data ;
        }) ;

    }
}
