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

    includeInApp(med) {
        var pharma_class = med.pharma_class.toLowerCase() ;
        var thera_class = med.thera_class.toLowerCase() ;
        var name = med.name.toLowerCase() ;
        
        // Exclusion list
        var exclPharmCls = ['CONTACT LENS PREPARATIONS(GAS,HARD,SOFT)', 'EAR PREPARATIONS, MISC. ANTI-INFECTIVES', 'EYE DIAGNOSTIC AGENTS',
                          'EYE IRRIGATIONS', 'EYE PREPARATIONS, MISCELLANEOUS (OTC)', 'MEDICAL SUPPLIES,MISCELLANEOUS(GROUP 2)', 
                          'OPHTHALMIC ANTIFIBROTIC AGENTS', 'OPHTHALMIC PREPARATIONS, MISCELLANEOUS', 'OPHTHALMIC SURGICAL AIDS',
                          'EYE ANTI-INFECTIVES (RX ONLY)'] ;      
        if (exclPharmCls.indexOf(pharma_class.toUpperCase()) >= 0) {
          return false ;
        }      
  
        // Oral and specific meds/classes
        if (med.routes.toLowerCase().indexOf('oral') >= 0 && 
          (name.indexOf("acetazolamide") >= 0 || name.indexOf("methazolamide") >= 0 || thera_class.indexOf('antivirals') >= 0 || pharma_class.indexOf('glucocorticoids') >= 0)) {
          return true ;
        } 
        // ophth routes
        if (med.routes.toLowerCase().indexOf('ophth') >= 0) {
          return true ;
        }
        
        if (pharma_class.indexOf('ophth') >= 0 || pharma_class.indexOf('eye ') >= 0) {
            return true ;
        }
  
        return false ;
      }

    dblog(act, msg) {
        this.seal.dblog(act, msg, this.APP_ID) ;
    }
}
