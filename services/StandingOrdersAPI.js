import SealAPI from "./SealAPIService";

export default class StandingOrdersAPI {
    
    constructor ($axios, $store) {
        this.axios = $axios ;
        this.store = $store ;
        this.APP_ID = 9 ;            
        this.seal = new SealAPI($axios) ;
    }

    orders(epicPatientId) {
        return this.axios({
            method: 'get',
            url: "/fhir-app/standingorders/api/v1/orders?epicPatientId=" + epicPatientId + "&pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
        }).then((response) => {            
            return response.data ;
        })                  
    }

    labdata(epicPatientId, loincCodes, minOrderDate, nextUrl) {
        
        var body = { "loinc-codes": loincCodes } ;

        var url = "/fhir-app/standingorders/api/v1/labdata?min_order_time=" + minOrderDate + "&epicPatientId=" + epicPatientId + "&pid=" + this.store.state.patientId + "&aid=" + this.APP_ID ;
        
        if (nextUrl && nextUrl !== '') {
            url = url + "&next=" + encodeURIComponent(nextUrl) ;            
        }

        return this.axios
            .post(url, body)
            .then( (response) => { 
                return response.data ;
            }) ;
    }
    
    predictions() {
        return this.axios({
            method: 'get',
            url: "/fhir-app/standingorders/api/v1/predictions?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
        }).then((response) => {            
            return response.data.data ;
        })                  
    }

    dblog(act, msg) {
        this.seal.dblog(act, msg, this.APP_ID) ;
    }
}
