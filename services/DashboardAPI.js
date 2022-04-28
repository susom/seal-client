/* eslint-disable */

import SealAPI from "./SealAPIService";

export default class DashboardAPI {

    constructor ($axios, $store) {
        this.axios = $axios ;
        this.store = $store ;
        this.APP_ID = 5 ;            
        this.seal = new SealAPI($axios) ;
    }

    appstats() {    
        return this.axios({
            method: 'get',
            url: "/fhir-app/dashboard/api/v1/appstats?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
        }).then((response) => {            
            return response.data.data ;
        })          
    }

    /**
     * 
     * @param {*} startdate in yyyy-mm-dd format
     * @param {*} enddate in yyyy-mm-dd format
     * @param {*} groupBy - yyyy-mm or yyyy format
     * @returns 
     */
    appstats2(startdate, enddate, groupBy) {    
        return this.axios({
            method: 'get',
            url: "/fhir-app/dashboard/api/v1/appstats2?start_date=" + startdate + "&end_date=" + enddate + "&groupBy=" + groupBy
                  + "&pid=" + this.store.state.patientId + "&aid=" + this.APP_ID 
        }).then((response) => {            
            return response.data.data ;
        })          
    }

    counts() {    
        return this.axios({
            method: 'get',
            url: "/fhir-app/dashboard/api/v1/counts?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
        }).then((response) => {            
            return response.data.data ;
        })          
    }

    top10() {    
        return this.axios({
            method: 'get',
            url: "/fhir-app/dashboard/api/v1/top10?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
        }).then((response) => {            
            return response.data.data ;
        })          
    }

    dblog(act, msg) {
        this.seal.dblog(act, msg, this.APP_ID) ;
    }
}
/* eslint-enable */
