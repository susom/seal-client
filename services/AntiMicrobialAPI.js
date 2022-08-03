import SealAPI from "./SealAPIService";

export default class AntiMicrobialAPI {
    
    constructor ($axios, $store) {
        this.axios = $axios ;
        this.store = $store ;
        this.APP_ID = 11 ;            
        this.seal = new SealAPI($axios) ;
    }

    inpatientdate() {
        return this.axios({
            method: 'get',
            url: "/fhir-app/antimicrobial/api/v1/inpatientdate?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
        }).then((response) => {            
            return response.data ;            
        })        
    }

    dblog(act, msg) {
        this.seal.dblog(act, msg, this.APP_ID) ;
    }
}
