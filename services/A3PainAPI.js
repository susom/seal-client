import SealAPI from "./SealAPIService";

export default class A3PainAPI {
    
    constructor ($axios, $store) {
        this.axios = $axios ;
        this.store = $store ;
        this.APP_ID = 7 ;            
        this.seal = new SealAPI($axios) ;
    }

    patient() {
        return this.axios({
            method: 'get',
            url: "/fhir-app/a3pain/api/v1/patient?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
        }).then((response) => {            
            return response.data ;            
        })        
    }

    encounters(report_date, no_of_weeks_ahead, no_of_weeks_back) {    
        return this.axios({
            method: 'get',
            url: "/fhir-app/a3pain/api/v1/enc?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID +
                "&rash_date=" + report_date + "&no_of_weeks_back=" + no_of_weeks_back + "&no_of_weeks_ahead=" + no_of_weeks_ahead
        }).then((response) => {            
            return response.data.data ;
        })        
    }
    
    medstats(report_date, no_of_weeks_ahead, no_of_weeks_back) {    
        return this.axios({
            method: 'get',
            url: "/fhir-app/a3pain/api/v1/med?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID +
                 "&rash_date=" + report_date + "&no_of_weeks_back=" + no_of_weeks_back + "&no_of_weeks_ahead=" + no_of_weeks_ahead
        }).then((response) => {            
            return response.data ;
        })        
    }

    heartRate() {    
        return this.axios({
            method: 'get',
            url: "/fhir-app/wellscalc/api/v1/heartrate?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
        }).then((response) => {            
            return response.data ;
        })        
    }

    mardata1(wsjson) {
        console.log("inside mardata method in the service layer...") ;
        return this.axios
            .post("/fhir-app/a3pain/api/v1/mardata?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID, wsjson) ;
            //.then( (response) => { 
            //    return response.data ;
            //}) ;        
    }

    mardata(wsjson) {
        var wscalls = [] ;

        Object.keys(wsjson).forEach(csn => {
            console.log("getting mar data for " + csn + " json :" + JSON.stringify(wsjson[csn])) ;
            
            //if (wsjson[csn].OrderIDs.length > 0) {  // skip if there are no orders
                wscalls.push(this.axios
                    .post("/fhir-app/a3pain/api/v1/mardata?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID, wsjson[csn])) ;
            //}
        }) ;
        
        return Promise.all(wscalls) ;
        //return this.axios.all(wscalls) ;
    }

    dblog(act, msg) {
        this.seal.dblog(act, msg, this.APP_ID) ;
    }
}
