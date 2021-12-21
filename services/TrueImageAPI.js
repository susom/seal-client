import SealAPI from "./SealAPIService";

export default class TrueImageAPI {
    
    constructor ($axios, $store) {
        this.axios = $axios ;
        this.store = $store ;
        this.APP_ID = 7 ;            
        this.seal = new SealAPI($axios) ;
    }

    emails(dt, provId) {    
        return this.axios({
            method: 'get',
            url: "/fhir-app/trueimage/api/v1/emails?email_date=" + dt + "&prov_id=" + provId + "&pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
        }).then((response) => {            
            return response.data ;
        })          
    }

    seal_photos(dt, provId) {    
        return this.axios({
            method: 'get',
            url: "/fhir-app/trueimage/api/v1/sealphotos?email_date=" + dt + "&prov_id=" + provId + "&pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
        }).then((response) => {            
            return response.data.data ;
        })          
    }

    modalData(image, dt, provId) {
        return this.axios({
            method: 'get',
            url: "/fhir-app/trueimage/api/v1/modal?image=" + image.scan_file + "&dt=" + dt + "&prov_id=" + provId + "&aid=" + this.APP_ID            
        }) ;
        /*.then((response) => {            
            return response.data ;
        })
        */                  
    }

    dblog(act, msg) {
        this.seal.dblog(act, msg, this.APP_ID) ;
    }
}
