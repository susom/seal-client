/* eslint-disable */

import SealAPI from "./SealAPIService";

export default class A3PainAPI {

    constructor ($axios, $store) {
        this.axios = $axios ;
        this.store = $store ;
        this.APP_ID = 6 ;            
        this.seal = new SealAPI($axios) ;
    }

    patient() {
        return this.axios({
            method: 'get',
            url: "/fhir-app/a3pain/api/v1/patient?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
        }).then((response) => {            
            return response.data ;            
        })        
    }

    encounters(start_date, end_date) {    
        return this.axios({
            method: 'get',
            url: "/fhir-app/a3pain/api/v1/enc?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID +
                    "&start_date=" + start_date + "&end_date=" + end_date 
        }).then((response) => {            
            return response.data.data ;
        })        
    }
    
    medstats(start_date, end_date, nextUrl) {    

        var url = "/fhir-app/a3pain/api/v1/med?start_date=" + start_date +
            "&end_date=" + end_date + "&pid=" + this.store.state.patientId + "&aid=" + this.APP_ID ;
        
        if (nextUrl && nextUrl !== '') {
            url = "/fhir-app/a3pain/api/v1/med?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID + "&next=" + encodeURIComponent(nextUrl) ;
        }

        return this.axios({
            method: 'get',
            url: url
        }).then((response) => {            
            return response.data ;
        }) ;
   
    }

    pain(start_date, end_date, epic_patient_id) {    
        return this.axios({
            method: 'get',
            url: "/fhir-app/a3pain/api/v1/pain?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID +
                "&start_date=" + start_date + "&end_date=" + end_date + "&epicPatientId=" + epic_patient_id
        }).then((response) => {            
            return response.data ;
        })        
    }

    mardata(wsjson) {
        var wscalls = [] ;

        Object.keys(wsjson).forEach(csn => {
            console.log("getting mar data for " + csn + " json :" + JSON.stringify(wsjson[csn])) ;
            
            if (wsjson[csn].OrderIDs.length > 0) {  // skip if there are no orders
                wscalls.push(this.axios
                    .post("/fhir-app/a3pain/api/v1/mardata?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID, wsjson[csn])) ;
            }
        }) ;
        
        return Promise.all(wscalls) ;
        //return this.axios.all(wscalls) ;
    }

    painwsdata(csnids, epic_patient_id) {
        var wscalls = [] ;

        csnids.forEach(csn => {
            var wsjson = {
                "PatientID": epic_patient_id,
                "PatientIDType":"EXTERNAL",
                "ContactID": csn,
                "ContactIDType":"CSN",
                "LookbackHours":"72",
                "UserID":"",
                "UserIDType":"",
                "FlowsheetRowIDs":[{"ID":"30404607","Type":"EXTERNAL"}]
            } ;
            console.log("getting mar data for " + csn + " json :" + JSON.stringify(wsjson)) ;

            wscalls.push(this.axios
                .post("/fhir-app/a3pain/api/v1/painwsdata?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID, wsjson)) ;
            
        }) ;
        
        return Promise.all(wscalls) ;
    }

    explodePatchMARRecords(med, order) {
        var ma = {} ; 
        var logMesg = "" ;
                        
        var strength = med.strength ;
        var unitStr = med.unit ;
        var form = med.form ;
        logMesg += "\n This is transdermal med " + medstats.cats[cIdx].name + " strength: " +  strength + " unit: " + unitStr ;                               
        var unit = unitStr.split("/")[0] ;
        
        if (unit.trim() == "mcg")  // mme conv factor in the excel sheet is for mg 
            mmeFactor = mmeFactor / 1000 ;

        var duration = unitStr.split("/")[1] ;                                
        if (duration == "hour" || duration == "hr")
            duration = "hours" ;
        if (duration == "24" || duration == "24hr")
            duration = "days" ;
        
        logMesg += "\n         duration " + duration + " form " + form ;

        var newMarArr = [] ;
        for (var mIdx=0;mIdx<order.MedicationAdministrations.length;mIdx++) {
            var ma = order.MedicationAdministrations[mIdx] ;
            if (ma.Action == "Not Given" || ma.Action == 'Canceled Entry') {
                continue ;
            }
            var stdt = this.$moment(new Date(ma.AdministrationInstant)) ;
            var enddt = this.$moment(new Date(ma.AdministrationInstant)) ;
            if (form.toLowerCase().indexOf("weekly") >= 0) {
                enddt.add(7, 'days') ;
            } else if (form.toLowerCase().indexOf("72 hr") >= 0) {
                enddt.add(3, 'days') ;
            }
            logMesg += "\n       Looping for stdt " + stdt.format() + " end dt " + enddt.format() ;
            var newAdminDt = stdt ;
            while (true) {
                if (newAdminDt.isAfter(enddt)) break ;
                var maNew = {
                    Action: "Given", 
                    AdministrationInstant: newAdminDt.format(), 
                    Dose: { Value: strength, Unit: unit } 
                } ;
                newMarArr.push(maNew) ;
                newAdminDt.add(1, duration) ;
            }
        }
        console.log("New MAR array") ;
        console.log(newMarArr) ;
        
        logMesg += "\n NEW MAR ARRAY: " + JSON.stringify(newMarArr);
        
        if (newMarArr.length > 0)
            order.MedicationAdministrations = [].concat(order.MedicationAdministrations, newMarArr) ;
        
    }

    dblog(act, msg) {
        this.seal.dblog(act, msg, this.APP_ID) ;
    }
}
/* eslint-enable */
