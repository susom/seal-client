import SealAPI from "./SealAPIService";

export default class VisitSummaryAPI {
    
    constructor ($axios, $store) {
        this.axios = $axios ;
        this.store = $store ;
        this.APP_ID = 13 ;            
        this.seal = new SealAPI($axios) ;        
    }

    nextvisit() {
      return this.axios({
          method: 'get',
          url: "/fhir-app/visitsummary/api/v1/nextvisit?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
      }).then((response) => {            
          return response.data ;
      }) ;                
    }

    ophconditions() {
      return this.axios({
          method: 'get',
          url: "/fhir-app/visitsummary/api/v1/ophconditions?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
      }).then((response) => {            
          return response.data ;
      }) ;                
    }

    physicians() {
      return this.axios({
          method: 'get',
          url: "/fhir-app/visitsummary/api/v1/physicians?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
      }).then((response) => {            
          return response.data ;
      }) ;                
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

    surgicalhistory(epicPatientId, stdt, enddt) {
      return this.axios({
        method: 'get',
        url: "/fhir-app/synopsis/api/v1/surgicalhistory?epicPatientId=" + epicPatientId + "&start_date=" + stdt + "&end_date=" + enddt + "&pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
      }).then((response) => {            
          return response.data ;
      }) ;                      
    }

    ophtests(epicPatientId, stdt, enddt) {
      return this.axios({
        method: 'get',
        url: "/fhir-app/synopsis/api/v1/ophtests?epicPatientId=" + epicPatientId + "&start_date=" + stdt + "&end_date=" + enddt + "&pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
      }).then((response) => {            
          return response.data ;
      }) ;                      
    }

    dblog(act, msg) {
        this.seal.dblog(act, msg, this.APP_ID) ;
    }
}
