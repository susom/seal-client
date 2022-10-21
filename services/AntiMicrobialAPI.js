import SealAPI from "./SealAPIService";

export default class AntiMicrobialAPI {
    
    constructor ($axios, $store) {
        this.axios = $axios ;
        this.store = $store ;
        this.APP_ID = 11 ;            
        this.seal = new SealAPI($axios) ;
    }

    cultureData(stdt, enddt) {
        return this.axios({
            method: 'get',
            url: "/fhir-app/antimicrobial/api/v1/culturedata?start_date=" + stdt + "&end_date=" + enddt + "&pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
          }).then((response) => {            
              return response.data ;
          }) ;                             
    }

    susceptability(observationIds) {
        var wscalls = [] ;

        observationIds.forEach(obsId => {
          wscalls.push(this.axios
                        .get("/fhir-app/antimicrobial/api/v1/susceptability?obs_fhir_id=" + obsId + "&pid=" + this.store.state.patientId + "&aid=" + this.APP_ID)) ; 
        }) ;
        
        return Promise.all(wscalls) ;
    }    

    surgicalData(stdt, enddt) {
        return this.axios({
            method: 'get',
            url: "/fhir-app/antimicrobial/api/v1/surgicaldata?start_date=" + stdt + "&end_date=" + enddt + "&pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
          }).then((response) => {            
              return response.data ;
          }) ;                             
    }

    dblog(act, msg) {
        this.seal.dblog(act, msg, this.APP_ID) ;
    }
}
