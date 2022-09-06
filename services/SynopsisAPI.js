import SealAPI from "./SealAPIService";

export default class SynopsisAPI {
    
    constructor ($axios, $store) {
        this.axios = $axios ;
        this.store = $store ;
        this.APP_ID = 12 ;            
        this.seal = new SealAPI($axios) ;        
    }

    /**
     * 
     * @param {Start date in YYYY-MM-DD format} stdt 
     * @param {End date in YYYY-MM-DD format} enddt 
     * @returns list of encounters to the "Eye Institute at Stanford" [{pat_enc_csn_id, fhir_id}]
     */
    eyevisits(stdt, enddt) {
        return this.axios({
            method: 'get',
            url: "/fhir-app/synopsis/api/v1/eyevisits?start_date=" + stdt + "&end_date=" + enddt + "&pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
        }).then((response) => {            
            return response.data ;
        }) ;                
    }
    
    getresults(eyevisitEncounters) {
        var wscalls = [] ;

        eyevisitEncounters.forEach(enc => {
          wscalls.push(this.axios
                        .get("/fhir-app/synopsis/api/v1/smartdatavalue?enc_fhir_id=" + enc.fhir_id + "&pid=" + this.store.state.patientId + "&aid=" + this.APP_ID)) ;            
        }) ;
        
        return Promise.all(wscalls) ;

    }
    

    smartdatavalue(encFhirId) {
      return this.axios({
        method: 'get',
        url: "/fhir-app/synopsis/api/v1/smartdatavalue?enc_fhir_id=" + encFhirId + "&pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
      }).then((response) => {            
          return response.data ;
      }) ;                      
    }

    dblog(act, msg) {
        this.seal.dblog(act, msg, this.APP_ID) ;
    }
}
