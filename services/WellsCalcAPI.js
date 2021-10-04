import SealAPI from "./SealAPIService";

export default class WellsCalcAPI {
    
    constructor ($axios, $store) {
        this.axios = $axios ;
        this.store = $store ;
        this.APP_ID = 4 ;            
        this.seal = new SealAPI($axios) ;
    }

    patient() {
        /*
        var json = 
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
            "seal_conditions" : [ {
              "seal_condition_id" : 27,
              "condition_name" : "TBD: Test Diabetes",
              "condition_date_long" : 1624345200000,
              "condition_date_str" : "06/22/2021",
              "risk_category" : "Diabetes History",
              "condition_source" : "USER",
              "notes" : "to test diabetes selection",
              "status_code" : "A",
              "created_by" : "SHC",
              "updated_by" : "SHC",
              "created_by_name" : "User, SHC",
              "updated_by_name" : "User, SHC",
              "created_dttm_str" : "06/22/2021 08:51:14 AM",
              "updated_dttm_str" : "06/22/2021 09:02:12 AM"
            }, {
              "seal_condition_id" : 34,
              "condition_name" : "Essential hypertension",
              "condition_date_long" : 1225263600000,
              "condition_date_str" : "10/29/2008",
              "risk_category" : "",
              "condition_source" : "EPIC",
              "notes" : "Not right \nThis is correct",
              "status_code" : "A",
              "created_by" : "SHC",
              "updated_by" : "SHC",
              "created_by_name" : "User, SHC",
              "updated_by_name" : "User, SHC",
              "created_dttm_str" : "07/07/2021 01:15:54 PM",
              "updated_dttm_str" : "07/07/2021 01:31:03 PM"
            }, {
              "seal_condition_id" : 28,
              "condition_name" : "TBD: Second test",
              "condition_date_long" : 1624345200000,
              "condition_date_str" : "06/22/2021",
              "risk_category" : "CHF History",
              "condition_source" : "USER",
              "notes" : "Lets hope this works!",
              "status_code" : "I",
              "created_by" : "SHC",
              "updated_by" : "SHC",
              "created_by_name" : "User, SHC",
              "updated_by_name" : "User, SHC",
              "created_dttm_str" : "06/22/2021 10:17:23 AM",
              "updated_dttm_str" : "07/07/2021 01:31:51 PM"
            } ]
          } ;

          return json ;
        */

        return this.axios({
            method: 'get',
            url: "/fhir-app/wellscalc/api/v1/patient?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
        }).then((response) => {            
            return response.data ;            
        }) 
               
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
            url: "/fhir-app/wellscalc/api/v1/conditions?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
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

    surgicalHistory(epicPatientId) {
        console.log("inside the surgicalhistory ajax call for " + epicPatientId) ;

        return this.axios({
            method: 'get',
            url: "/fhir-app/wellscalc/api/v1/surgicalhistory?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID + "&epicPatientId=" + epicPatientId
        }).then((response) => {            
            return response.data ;
        })        
    }

    dblog(act, msg) {
        this.seal.dblog(act, msg, this.APP_ID) ;
    }
}
