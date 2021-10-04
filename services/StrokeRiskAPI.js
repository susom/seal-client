import SealAPI from "./SealAPIService";

export default class StrokeRiskAPI {
    
    constructor ($axios, $store) {
        this.axios = $axios ;
        this.store = $store ;
        this.APP_ID = 3 ;            
        this.seal = new SealAPI($axios) ;
    }

    conditions() {
      /*
        var json =  
        [ {
          "condition" : "Pneumonia, organism unspecified",
          "icd10" : "J18.9",
          "asserted_date" : "07/05/2011",
          "asserted_date_long" : 1309849200000,
          "category" : "Problem List Item",
          "clinical_status" : "ACTIVE",
          "verification_status" : "CONFIRMED"
        }, {
          "condition" : "Hypothyroidism",
          "icd10" : "E03.9",
          "asserted_date" : "11/03/2008",
          "asserted_date_long" : 1225699200000,
          "category" : "Problem List Item",
          "clinical_status" : "ACTIVE",
          "verification_status" : "CONFIRMED"
        }, {
          "condition" : "Essential hypertension",
          "icd10" : "I10",
          "asserted_date" : "10/29/2008",
          "asserted_date_long" : 1225263600000,
          "category" : "Problem List Item",
          "clinical_status" : "ACTIVE",
          "verification_status" : "CONFIRMED"
        }, {
          "condition" : "Gastroesophageal reflux disease",
          "icd10" : "K21.9",
          "asserted_date" : "10/29/2008",
          "asserted_date_long" : 1225263600000,
          "category" : "Problem List Item",
          "clinical_status" : "ACTIVE",
          "verification_status" : "CONFIRMED"
        } ] ;

          return json ;
        */

        return this.axios({
            method: 'get',
            url: "/fhir-app/srcalc/api/v1/conditions?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
        }).then((response) => {            
            return response.data ;
        }) ;                
    }

    save(sealCondition) {
        
        sealCondition.patient_id = this.store.state.patientId ;

        return this.axios
            .post("/fhir-app/srcalc/api/v1/sealcondition?aid=" + this.APP_ID + "&pid=" + this.store.state.patientId, sealCondition)
            .then( (response) => { 
                return response.data ;
            }) ;        
    }

    dblog(act, msg) {
        this.seal.dblog(act, msg, this.APP_ID) ;
    }
}
