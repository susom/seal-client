import SealAPI from "./SealAPIService";

export default class StrokeRiskAPI {
    
    constructor ($axios, $store) {
        this.axios = $axios ;
        this.store = $store ;
        this.APP_ID = 5 ;            
        this.seal = new SealAPI($axios) ;
    }

    patient() {
        return this.axios({
            method: 'get',
            url: "/fhir-app/srcalc/api/v1/patient?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
        }).then((response) => {            
            return response.data ;            
        })        
    }

    conditions() {
        //var response = await this.$axios.get("/fhir-app/srcalc/api/v1/conditions?pid=" + this.$store.state.patientId + "&aid=" + APP_ID) ;        
        return this.axios({
            method: 'get',
            url: "/fhir-app/srcalc/api/v1/conditions?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
        }).then((response) => {            
            return response.data ;
        })        
    }

    dblog(act, msg) {
        this.seal.dblog(act, msg, this.APP_ID) ;
    }
}
