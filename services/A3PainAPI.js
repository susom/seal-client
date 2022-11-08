/* eslint-disable */

import SealAPI from "./SealAPIService";
import Highcharts from 'highcharts' ;

export default class A3PainAPI {

    constructor ($axios, $store, $moment) {
        this.axios = $axios ;
        this.store = $store ;
        this.moment = $moment ;
        console.log("In A3PainAPI.js constrcutor") ;
        console.log(this.moment) ;
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
    
    medstats(start_date, end_date, nextUrl) {    

        var url = "/fhir-app/a3pain/api/v1/med?start_date=" + start_date +
            "&end_date=" + end_date + "&pid=" + this.store.state.patientId + "&aid=" + this.APP_ID ;
        
        if (nextUrl && nextUrl !== '') {
            url = "/fhir-app/a3pain/api/v1/med?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID + "&start_date=" + start_date +
                    "&end_date=" + end_date + "&next=" + encodeURIComponent(nextUrl) ;
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
        }).catch((error) => {
            console.log("Error in PCA Ajax Call :" + error) ;
            return [] ;
        })        
    }

    pca_mars(start_date, end_date) {
        return this.axios({
            method: 'get',
            url: "/fhir-app/a3pain/api/v1/pcas?pid=" + this.store.state.patientId + "&aid=" + this.APP_ID +
                "&start_date=" + start_date + "&end_date=" + end_date 
        }).then((response) => {            
            return response.data ;
        }).catch((error) => {
            console.log("Error in PCA Ajax Call :" + error) ;
            return [] ;
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
            var stdt = this.moment(new Date(ma.AdministrationInstant)) ;
            var enddt = this.moment(new Date(ma.AdministrationInstant)) ;
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
        
        return logMesg ;
    }

    processEpiduralInfusions(order) {
        // order them in chronologic order asc 
        order.MedicationAdministrations.sort((x, y) => 
            new Date(x.AdministrationInstant).getTime() - new Date(y.AdministrationInstant).getTime()
        ) ;
        console.log(order.MedicationAdministrations) ;
        var stTime, endTime ;
        var newMarArr = [] ;
        var strength, unit ;
        var newBagStarted = false ;

        order.MedicationAdministrations.forEach(ma => {            
            if (!newBagStarted && (ma.Action == 'New Bag' || ma.Action == 'Restarted')) {
                console.log("In New Bag " + JSON.stringify(ma)) ;
                stTime = ma.AdministrationInstant ;
                strength = ma.Dose.Value ;
                unit = ma.Dose.Unit ;
                newBagStarted = true ;
                return ;                
            }
            if (ma.Action == 'Stopped' || ma.Action == 'HighAlert RateChange') {
                newBagStarted = false ;
                endTime = this.moment(new Date(ma.AdministrationInstant)) ;
                
                if (ma.Action == 'HighAlert RateChange') 
                    endTime.add(-1, 'minutes') ;

                var newAdminDt = this.moment(new Date(stTime)) ;
                newAdminDt.add(1, 'hour') ;
                while (true) {
                    if (newAdminDt.isAfter(endTime)) {
                        var maNew = {
                            Action: "Given", 
                            AdministrationInstant: endTime.utc().format(), 
                            Dose: { Value: strength, Unit: unit } 
                        } ;
                        newMarArr.push(maNew) ;
                        break ;
                    } else {                        
                        var maNew = {
                            Action: "Given", 
                            AdministrationInstant: newAdminDt.utc().format(), 
                            Dose: { Value: strength, Unit: unit } 
                        } ;
                        newMarArr.push(maNew) ;
                        newAdminDt.add(1, 'hour') ;
                    }
                }
                if (ma.Action == 'HighAlert RateChange')  {
                    stTime = ma.AdministrationInstant ;
                    strength = ma.Dose.Value ;
                    unit = ma.Dose.Unit ;
                    newBagStarted = true ;
                }
            }
        }) ;
        order.MedicationAdministrations = newMarArr ;
        console.log("New MAR Array") ;
        console.log(newMarArr) ;
    }
    /**
     * 
     * @param {start date in yyyy-mm-dd format } startdt 
     * @param {end date} enddate 
     */
    async getTotalMMEForLast24Hours(dischargeTime, marData, epicPatientId, log) {

        var totalMME = 0 ;
        
        log("In gettotalmmeforlast24hrs method ") ;        
        
        var start_date = this.moment(dischargeTime).add(-1, "days").format("YYYY-MM-DD") ;
        var end_date = this.moment(dischargeTime).format("YYYY-MM-DD") ;
        
        var start_time_long = this.moment(dischargeTime).add(-1, 'days').valueOf() ;
        var end_time_long = this.moment(dischargeTime).valueOf() ;

        if (marData) {
            log("In marData method... ") ;
            marData.forEach(function (marPoint) {
                if (marPoint.x >= start_time_long && marPoint.x <= end_time_long)
                    totalMME += marPoint.mme ;
            }) ;
            log("Total MME from MAR records :" + totalMME) ;
            return totalMME ;
        }

        var encounters = await this.encounters(start_date, end_date) ;                
        log("Encounters :" + JSON.stringify(encounters)) ;

        var responses = [] ;
        var response = {} ;
        var medstats = { cats:[] } ;

        response = await this.medstats(start_date, end_date) ;        
        responses.push(response) ;
        log("MedStats 1st Response : " + JSON.stringify(response)) ;

        while (response.nextUrl) {
            response = await this.medstats(start_date, end_date, response.nextUrl) ;
            responses.push(response) ;
        }

        responses.forEach((response) => {
            response.cats.forEach((med) => {                    
                try {
                var medIdx = medstats.cats.findIndex(cat => cat.name == med.name) ;
                if (medIdx === -1) {
                    medstats.cats.push(med) ;
                } else {
                    medstats.cats[medIdx].data = [].concat(medstats.cats[medIdx].data, med.data) ;
                    medstats.cats[medIdx].mme = Object.assign({}, medstats.cats[medIdx].mme, med.mme) ;                        
                    medstats.cats[medIdx].routes = this.merge(medstats.cats[medIdx].routes, med.routes) ;
                    medstats.cats[medIdx].med_order_ids = [].concat(medstats.cats[medIdx].med_order_ids, med.med_order_ids) ;
                }
                } catch (err) {
                    log("Error in medstats processing :" + err) ;
                }
            });              
        }) ;
        
        var wsjson = {} ;
        var csnids = [] ;

        encounters.forEach(enc => {
            csnids.push(enc.pat_enc_csn_id) ;

            wsjson[enc.pat_enc_csn_id] = {
                "PatientID": epicPatientId,
                "PatientIDType": "External", 
                "ContactID": enc.pat_enc_csn_id,
                "ContactIDType": "CSN",
                "OrderIDs": []
            } ;
            
        });

        medstats.cats.forEach(cat => {
            log("MedStats Med Name:" + cat.name + " MedOrderIds: " + cat.med_order_ids + ": MME Info: " + JSON.stringify(cat.mme)) ;
            cat.data.forEach(med => {
                for (var i=0; i<encounters.length; i++) {
                    if ((med.x >= encounters[i].start && med.x <= encounters[i].end) || 
                        (med.x2 >= encounters[i].start && med.x2 <= encounters[i].end)) {
                        if (med.med_order_id) {   // for some reason row is created with empty ID
                            wsjson[encounters[i].pat_enc_csn_id].OrderIDs.push({ "ID": med.med_order_id, "Type" : "External"}) ;
                        }
                    }
                }
            }) ;
        }) ;
        
        log("json for MAR data webservice call :" + JSON.stringify(wsjson)) ;

        //MAR data for Patient Controlled Analgesics
        var pca_mars = await this.pca_mars(start_date, end_date) ;
        log("PCA_MARS size :" + pca_mars.length) ;

        var responses = await this.mardata(wsjson) ;

        //this.mardata(wsjson).then(responses => {
            log("In mardata responses " + JSON.stringify(responses)) ;

            responses.forEach(response => {
                response.data.Orders.forEach(order => {                                                        
                    var cIdx = medstats.cats.findIndex(function (cat) { return (cat.med_order_ids.indexOf(order.OrderID.ID) >= 0) }) ;
                    if (cIdx < 0) {
                        return true ;
                    }                  
                    var mmeJSON = {} ;          
                    var mmeFactor = 0 ;
                    var genericName = "" ;
                    
                    if (medstats.cats[cIdx].mme[order.OrderID.ID]) {
                        mmeJSON = medstats.cats[cIdx].mme[order.OrderID.ID] ;
                        mmeFactor = mmeJSON.conv_factor ;
                    } else {
                        //this.resultText += " - no matching mme data ";
                    }
                    genericName = medstats.cats[cIdx].generic_name ;
                    if (genericName == '')
                        genericName = medstats.cats[cIdx].name ;
                    
                    try {                    
                    if (medstats.cats[cIdx].routes.toLowerCase().indexOf("transdermal") >= 0) {
                        var logMesg = this.explodePatchMARRecords(medstats.cats[cIdx], order) ;
                        log(logMesg) ;
                    }
                    var ma = {} ; 
                    for (var mIdx=0;mIdx<order.MedicationAdministrations.length;mIdx++) {
                        ma = order.MedicationAdministrations[mIdx] ;
                        if (new Date(ma.AdministrationInstant).getTime() < start_time_long || new Date(ma.AdministrationInstant).getTime() > end_time_long) {
                            log("Skipping mar " + JSON.stringify(ma) + " cause admin time is not within reporting period") ;
                            continue ;
                        }
                        if (ma.Action != "Not Given" && ma.Action != 'Canceled Entry') {
                            if (!ma.Dose["Value"] || ma.Dose.Value == "null") continue ;
                            if (!ma.Dose.Unit) ma.Dose.Unit = "" ;
                            ma.Dose.Unit = ma.Dose.Unit.toLowerCase() ;
                            mmeFactor = mmeJSON.conv_factor ;
                            if (ma.Dose.Unit != mmeJSON.conv_unit) {
                                if (ma.Dose.Unit == "mcg" && mmeJSON.conv_unit == "mg")
                                    mmeFactor = mmeFactor / 1000 ;
                                else if (ma.Dose.Unit == "mg" && mmeJSON.conv_unit == "mcg")
                                    mmeFactor = mmeFactor * 1000 ;
                                else if (ma.Dose.Unit == "ml" && mmeJSON.conv_unit == "mcg")
                                    mmeFactor = mmeFactor * 1000 ;
                            } 

                            ma.mme = parseFloat(ma.Dose.Value) * mmeFactor ;
                            if (ma.mme)
                                ma.mme = parseFloat(ma.mme.toFixed(2)) ;
                            
                            totalMME += ma.mme ;                            
                        }
                    }
                    } catch (err) {
                        log("Error in MME aggregation :" + err ) ;
                        log(JSON.stringify(ma)) ;
                    }                            
                }) ; 
            //}) ;
            
            if (pca_mars) {
                pca_mars.forEach(med => {                    
                    med.data.forEach(point => {
                        //var marTime = point.recorded_time ;
                        point.mme = point.dosage * med.conv_factor ;
                        point.mme = parseFloat(point.mme.toFixed(2)) ;
                        
                        totalMME += point.mme ;
                    }); 
                }) ;
            } ;
        }) ;
        log("Method end...") ;     
        log("Total MME is :"  + totalMME) ;
        return totalMME ;   
    }

    dblog(act, msg) {
        this.seal.dblog(act, msg, this.APP_ID) ;
    }

    roadChart(totalMME, distStartDate) {
        console.log("In roadChart totalMME :" + totalMME) ;        

        var days = [] ;
        var weeks = [] ;
        var dosage = [] ;
        //var currentDate = this.moment().add(1, 'days').startOf("day") ;
        var currentDate = this.moment(distStartDate, "MM/DD/YYYY").startOf("day") ;

        totalMME = Math.round(totalMME / 1.5) ;

        if (totalMME > 60) {
            var remainingMME = Math.floor(totalMME / 5) * 5 ;
            var weekNbr = 0 ;
            while (remainingMME > 60) {      
                weekNbr++ ;          
                weeks.push({ week_nbr: weekNbr, mme: remainingMME}) ;

                for (var i=0;i<7;i++) {
                    dosage.push({strength: remainingMME, freq: 0, date: currentDate.valueOf()}) ;
                    currentDate.add(1, 'days') ;
                }
                remainingMME = remainingMME * .9 ;
                remainingMME = Math.floor(remainingMME / 5) * 5 ;                
            }
            totalMME = remainingMME ;
        }
    
        if (totalMME == 0)
            dosage = [] ;
        else if (totalMME <= 10)
            dosage = dosage.concat([ {strength: 5, freq: 2}, {strength: 5, freq: 2}]) ;
        else if (totalMME <= 20)
            dosage = dosage.concat([{strength: 5, freq: 4}, {strength: 5, freq: 4}, {strength: 5, freq: 2}, {strength: 5, freq: 2}]) ;
        else if (totalMME <= 30)
            dosage = dosage.concat([{strength: 5, freq: 6}, {strength: 5, freq: 6}, {strength: 5, freq: 4}, {strength: 5, freq: 4}, {strength: 5, freq: 2}, {strength: 5, freq: 2}]) ;
        else if (totalMME <= 40)
            dosage = dosage.concat([{strength: 10, freq: 4}, {strength: 10, freq: 4}, {strength: 10, freq: 3}, {strength: 10, freq: 3}, {strength: 5, freq: 4}, {strength: 5, freq: 4}, {strength: 5, freq: 2}, {strength: 5, freq: 2}]) ;
        else if (totalMME <= 50)
            dosage = dosage.concat([{strength: 10, freq: 5}, {strength: 10, freq: 5}, {strength: 10, freq: 4}, {strength: 10, freq: 4}, {strength: 10, freq: 3}, {strength: 10, freq: 3}, {strength: 5, freq: 4}, {strength: 5, freq: 4}, {strength: 5, freq: 2}, {strength: 5, freq: 2}]) ;
        else if (totalMME <= 60)
            dosage = dosage.concat([{strength: 10, freq: 6}, {strength: 10, freq: 6}, {strength: 10, freq: 5}, {strength: 10, freq: 5}, {strength: 10, freq: 4}, {strength: 10, freq: 4}, {strength: 10, freq: 3}, {strength: 10, freq: 3}, {strength: 5, freq: 4}, {strength: 5, freq: 4}, {strength: 5, freq: 2}, {strength: 5, freq: 2}]) ;

        dosage.forEach(dose => {
            if (!dose.date) {
                dose.date = currentDate.valueOf() ;
                currentDate.add(1, 'days') ;
            }
        });
        console.log("returning from roadchart : " + JSON.stringify(dosage)) ;
        
        return { dosage: dosage } ;
    }
}
/* eslint-enable */
