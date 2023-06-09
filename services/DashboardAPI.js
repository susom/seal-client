/* eslint-disable */

import SealAPI from "./SealAPIService";

export default class DashboardAPI {

    constructor ($axios, $store) {
        this.axios = $axios ;
        this.store = $store ;
        this.APP_ID = 5 ;            
        this.seal = new SealAPI($axios) ;
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

    top10(appId) {    
        return this.axios({
            method: 'get',
            url: "/fhir-app/dashboard/api/v1/top10?app_id=" + appId + "&pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
        }).then((response) => {            
            return response.data.data ;
        })          
    }

    newUsers(startdate, enddate, appId) {    
        return this.axios({
            method: 'get',
            url: "/fhir-app/dashboard/api/v1/newusers?start_date=" + startdate + "&end_date=" + enddate + "&app_id=" + appId + "&pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
        }).then((response) => {            
            return response.data.data ;
        })          
    }

    apps() {    
        return this.axios({
            method: 'get',
            url: "/fhir-app/dashboard/api/v1/apps?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
        }).then((response) => {            
            return response.data.data ;
        })          
    }

    dblog(act, msg) {
        this.seal.dblog(act, msg, this.APP_ID) ;
    }
}
/* eslint-enable */
