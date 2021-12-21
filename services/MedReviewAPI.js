
import SealAPI from "./SealAPIService" ;
import Highcharts from "highcharts" ;

export default class MedReviewAPI {
    
    constructor ($axios, $store) {
        this.axios = $axios ;
        this.store = $store ;
        this.APP_ID = 2 ;            
        this.seal = new SealAPI($axios, $store) ;
    }

    dblog(act, msg) {
        this.seal.dblog(act, msg, this.APP_ID) ;
    }

    chartdata(chartId) {
      return this.axios({
        method: 'get',
        url: "/fhir-app/medreview/api/v2/obs?id=" + chartId + "&pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
      }).then((response) => {            
          return response.data ;
      })
    }

    syndromes() {
      return this.axios({
        method: 'get',
        url: "/fhir-app/medreview/api/v2/syndromeconfigs?type=short&pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
      }).then((response) => {            
          return response.data ;
      })      
    }

    syndrome(code) {
      return this.axios({
        method: 'get',
        url: "/fhir-app/medreview/api/v2/syndromeconfig?syndrome=" + code + "&pid=" + this.store.state.patientId + "&aid=" + this.APP_ID
      }).then((response) => {            
          return response.data ;
      })            
    }

    saveOutsideMed(oMed) {        
      oMed.patient_id = this.store.state.patientId ;

      return this.axios
          .post("/fhir-app/medreview/api/v2/custommed?aid=" + this.APP_ID + "&pid=" + this.store.state.patientId, oMed)
          .then( (response) => { 
              return response.data ;
          }) ;        
    }

    deleteOutsideMed(oMed) {
      oMed.patient_id = this.store.state.patientId ;
      oMed.action = "delete" ;
      
      return this.axios
          .post("/fhir-app/medreview/api/v2/custommed?aid=" + this.APP_ID + "&pid=" + this.store.state.patientId, oMed)
          .then( (response) => { 
              return response.data ;
          }) ;        
    }
    /**
     * Removes duplicates and merges
     * 
     * @param {string with values separated by comma} string1 
     * @param {string with values separated by comma} string2
     * @returns combined string with unique values in it
     * 
     */
    unique_merge(string1, string2) {
        
        if (!string1) return string2 ;
        if (!string2) return string1 ;
        console.log("String1 {}", string1) ;
        console.log("String2 {}", string2) ;
        
        var arr1 = string1.split(",") ;
        var arr2 = string2.split(",") ;

        var arr = [] ;
        arr1.forEach(element => {
            if (arr.indexOf(element) < 0)
                arr.push(element) ;
        });
        arr2.forEach(element => {
            if (arr.indexOf(element) < 0)
                arr.push(element) ;
        });
        
        return arr.join(",") ;       
    }

    merge_meds(med1, med2)
    {
        console.log("Merge categories invoked for " + med1.name + " and " + med2.name) ;
        console.log(med1) ;
        console.log(med2) ;

        var cat = {} ;
        cat.id = med1.id ;
        cat.name = med1.name ;
        cat.ingredient = med1.ingredient ;
        cat.routes = this.unique_merge(med1.routes, med2.routes) ;
        cat.thera_class = this.unique_merge(med1.thera_class, med2.thera_class) ;
        cat.pharma_class = this.unique_merge(med1.pharma_class, med2.pharma_class) ;
        cat.data = med1.data.concat(med2.data) ;        
        cat.med_order_ids = med1.med_order_ids.concat(med2.med_order_ids) ;
        cat.syndromes = this.unique_merge(med1.syndromes, med2.syndromes) ;
        cat.pcat = this.unique_merge(med1.pcat, med2.pcat) ;

        if (med1.last_used_long > med2.last_used_long) {
            cat.last_used_long = med1.last_used_long ;
            cat.last_used = med1.last_used ;
        } else {
            cat.last_used_long = med2.last_used_long ;
            cat.last_used = med2.last_used ;
        }
        console.log("and the final merged cat is ") ;
        console.log(cat) ;
        return cat ;
    }

    getDefaultChartConfig(chartData)
    {
        var chartOptions ;

        chartOptions =
            {
                chart: {
                    marginLeft: 100, // Keep all charts left aligned
                    //spacingTop: 20,
                    //spacingBottom: 20,
                    zoomType: 'x',
                    displayErrors: true,
                    height: chartData.height
                    //plotBackgroundColor: '#F7F7F7'
                },
                title: {
                    text: chartData.title,
                    align: 'center'
                },
                credits: {
                    enabled: false
                },
                legend: {
                    enabled: false
                },
                xAxis: {
                    crosshair: true,
                    events: {
                        setExtremes: function(e) {
                          var thisChart = this.chart;
                          if (e.trigger !== 'syncExtremes') { // Prevent feedback loop                              
                              Highcharts.charts.forEach(function(chart, idx) {                                                              
                                  if (chart !== thisChart) {
                                      try {
                                          if (chart.xAxis[0].setExtremes) { // It is null while updating
                                              setTimeout(function() {
                                                  chart.xAxis[0].setExtremes(
                                                      e.min,
                                                      e.max,
                                                      true, //undefined,
                                                      false,
                                                      {trigger: 'syncExtremes'}
                                                  );
                                              }, 0) ;
                                          }
                                      } catch (ex) {
                                          console.log("Error in synxExtrement for " + chart) ;
                                          console.log(ex) ;
                                      }
                                  }
                              });
                          }                          
                        }
                    },
                    type: 'datetime',
                    min: chartData.start_time,
                    max: chartData.end_time
                },
                yAxis: [{
                    title: {
                        text: null
                    },
                    min: chartData.min,
                    max: chartData.max
                }],
                tooltip: {
                    shadow: false,                    
                    formatter: function () {

                        if (this.point.dose) {
                            // https://api.highcharts.com/class-reference/Highcharts.Time
                            return Highcharts.dateFormat('%d %b %Y %I:%M:%S %p', this.point.x) +
                                    "<br>" + this.point.name.toLowerCase() +
                                    "<br>Dosage: " + this.point.dose + " " + this.point.unit + " " + this.point.action ;
                        } else if (this.point.x2) {
                            // This is to handle the no stop date case.  If the diff is 5 years (set in backend), display '(none'
                            var diffInYears = (new Date(this.point.x2)).getYear() - (new Date(this.point.x)).getYear() ;
                            //console.log("diff in years :" + diffInYears + " for " + this.point.name)  ;
                            if (diffInYears == 5) {
                                return Highcharts.dateFormat('%d %b %Y', this.point.x) + "-(none) " +
                                    "<br>" + this.point.name.toLowerCase() +
                                    "<br>" + this.point.pcat.toLowerCase() ;
                            } else {
                                return Highcharts.dateFormat('%d %b %Y', this.point.x) + "-" + Highcharts.dateFormat('%d %b %Y', this.point.x2) +
                                    "<br>" + this.point.name.toLowerCase() +
                                    "<br>" + this.point.pcat.toLowerCase() ;
                            }
                        } else if (this.point.name) {
                            return this.point.name ;                                
                        } else {
                            return this.point.y + ((this.point.unit)?" " + this.point.unit:"") ;
                        }
                    },
                    //style: {
                    //    fontSize: '12px'
                    //},
                    valueDecimals: 2
                },
                plotOptions: {
                    series: {
                        dataLabels : {
                            allowOverlap: true
                        },
                        stickyTracking: false,
                        minPointLength: 10   // for the same date, xrange at least will display these many pixels
                    }
                },
                series: [{
                    //data: (data.dataset?data.dataset:[]),
                    name: chartData.name,
                    type: chartData.type,
                    color: chartData.color,
                    fillOpacity: 0.3,
                    xDateFormat: '%m/%d/%Y',
                    tooltip: {
                        //valueSuffix: ' ' + chartData.unit,
                        shared: true
                    }
                }]
            };

        return chartOptions ;

    }

    getMedResponses() {
        return [
            {
              "start_time": 1312354800000,
              "end_time": 1629097200000,
              "start_time_yyyymmdd": "2011-08-03",
              "end_time_yyyymmdd": "2021-08-16",
              "enc_pat_id": "e7uurjqx-qWSveUWOXHBkNQ3",
              "syndrome": "ALL",
              "cats": [
                {
                  "name": "nicotine 21 mg/24hr td pt24",
                  "data": [
                    {
                      "med_order_id": "889628",
                      "x": 1228896000000,
                      "x2": 1786863600000,
                      "y": 0,
                      "name": "nicotine 21 mg/24hr td pt24",
                      "color": "lightgreen",
                      "pcat": "Community"
                    }
                  ],
                  "syndromes": "",
                  "med_order_ids": [
                    "889628"
                  ],
                  "medId": "https://apporchard.epic.com/interconnect-aocurprd-oauth/api/FHIR/STU3/Medication/eSXWCxLKQS56lH9uth9o5wXSxnzY.6iKGpVCa0LWWcrHOuzaQta4gaQTRpO9EnvX03",
                  "pcat": "Community",
                  "routes": "Transdermal",
                  "last_used": "08/16/2026",
                  "last_used_long": 1786863600000,
                  "first_used": "12/10/2008",
                  "first_used_long": 1228896000000,
                  "rxCodes": [
                    "7407",
                    "198030"
                  ],
                  "ingredient": "nicotine"
                },
                {
                  "name": "ranitidine hcl 150 mg po tabs",
                  "data": [
                    {
                      "med_order_id": "887752",
                      "x": 1309874400000,
                      "x2": 1341261263000,
                      "y": 1,
                      "name": "ranitidine hcl 150 mg po tabs",
                      "color": "green",
                      "pcat": "Inpatient"
                    }
                  ],
                  "syndromes": "",
                  "med_order_ids": [
                    "887752"
                  ],
                  "medId": "https://apporchard.epic.com/interconnect-aocurprd-oauth/api/FHIR/STU3/Medication/erZZDYBIOqUMYRoBKY5poRDuOq1dZISqh1yfTS3KLdDFXZ6aZuVjYok6ITi5TSFHZ3",
                  "pcat": "Inpatient",
                  "routes": "Oral",
                  "last_used": "08/16/2021",
                  "last_used_long": 1629097200000,
                  "first_used": "07/05/2011",
                  "first_used_long": 1309874400000,
                  "rxCodes": [
                    "9143",
                    "198191",
                    "203136"
                  ],
                  "thera_class": "GASTROINTESTINAL",
                  "pharma_class": "HISTAMINE H2-RECEPTOR INHIBITORS",
                  "ingredient": "ranitidine"
                }
              ],
              "name": "Medications",
              "id": "medications",
              "nextUrl": "/MedicationStatement?effective=ge2011-08-03&effective=le2021-08-16&status=active,completed,stopped,on-hold&_include=MedicationStatement:medication&patient=e7uurjqx-qWSveUWOXHBkNQ3&_count=5&sessionID=09-C1B08154F52F11EBA0A40050568B7BE6"
            },
            {
              "start_time": 1628087103548,
              "end_time": 1628087103548,
              "start_time_yyyymmdd": null,
              "end_time_yyyymmdd": null,
              "enc_pat_id": "e7uurjqx-qWSveUWOXHBkNQ3",
              "syndrome": null,
              "cats": [
                {
                  "name": "nicotine 7 mg/24hr td pt24",
                  "data": [
                    {
                      "med_order_id": "889630",
                      "x": 1228896000000,
                      "x2": 1785853503548,
                      "y": 0,
                      "name": "nicotine 7 mg/24hr td pt24",
                      "color": "lightgreen",
                      "pcat": "Community"
                    }
                  ],
                  "syndromes": "",
                  "med_order_ids": [
                    "889630"
                  ],
                  "medId": "https://apporchard.epic.com/interconnect-aocurprd-oauth/api/FHIR/STU3/Medication/ec2EdIz35pNyygTeozpkhw4RvZ71WEfy5CXCoSalg3zdglNu2yDJTbKhCO2d1AhKm3",
                  "pcat": "Community",
                  "routes": "Transdermal",
                  "last_used": "08/04/2026",
                  "last_used_long": 1785853503548,
                  "first_used": "12/10/2008",
                  "first_used_long": 1228896000000,
                  "rxCodes": [
                    "7407",
                    "198031"
                  ],
                  "ingredient": "nicotine"
                },
                {
                  "name": "nicotine 14 mg/24hr td pt24",
                  "data": [
                    {
                      "med_order_id": "889629",
                      "x": 1228896000000,
                      "x2": 1785853503548,
                      "y": 1,
                      "name": "nicotine 14 mg/24hr td pt24",
                      "color": "lightgreen",
                      "pcat": "Community"
                    }
                  ],
                  "syndromes": "",
                  "med_order_ids": [
                    "889629"
                  ],
                  "medId": "https://apporchard.epic.com/interconnect-aocurprd-oauth/api/FHIR/STU3/Medication/eBQbIRqmHguWneK5v8Og9E-4xSOYwWwD2hQqK3t9pZZ.MetK8Qb.7eXm.nmi5eamV3",
                  "pcat": "Community",
                  "routes": "Transdermal",
                  "last_used": "08/04/2026",
                  "last_used_long": 1785853503548,
                  "first_used": "12/10/2008",
                  "first_used_long": 1228896000000,
                  "rxCodes": [
                    "7407",
                    "198029"
                  ],
                  "ingredient": "nicotine"
                }
              ],
              "name": "Medications",
              "id": "medications",
              "nextUrl": "/MedicationStatement?effective=ge2011-08-03&effective=le2021-08-16&status=active,completed,stopped,on-hold&_include=MedicationStatement:medication&patient=e7uurjqx-qWSveUWOXHBkNQ3&_count=5&sessionID=09-C24D9688F52F11EBA0A40050568B7BE6"
            },
            {
              "start_time": 1628087104597,
              "end_time": 1628087104597,
              "start_time_yyyymmdd": null,
              "end_time_yyyymmdd": null,
              "enc_pat_id": "e7uurjqx-qWSveUWOXHBkNQ3",
              "syndrome": null,
              "cats": [
                {
                  "name": "codeine-guaifenesin 10-100 mg/5ml po syrp",
                  "data": [
                    {
                      "med_order_id": "889598",
                      "x": 1282806000000,
                      "x2": 1785853504597,
                      "y": 0,
                      "name": "codeine-guaifenesin 10-100 mg/5ml po syrp",
                      "color": "lightgreen",
                      "pcat": "Community"
                    }
                  ],
                  "syndromes": "",
                  "med_order_ids": [
                    "889598"
                  ],
                  "medId": "https://apporchard.epic.com/interconnect-aocurprd-oauth/api/FHIR/STU3/Medication/eFaEzG1KIkTzmJpqIINo7DDm0q3GB9d93nIX0fD9OhkV03KzOhejXiQkZVvIUr.8j3",
                  "pcat": "Community",
                  "routes": "Oral",
                  "last_used": "08/04/2026",
                  "last_used_long": 1785853504597,
                  "first_used": "08/26/2010",
                  "first_used_long": 1282806000000,
                  "rxCodes": [
                    "2670",
                    "5032",
                    "214442",
                    "995868"
                  ],
                  "ingredient": "codeine,guaifenesin"
                },
                {
                  "name": "famotidine 20 mg po tabs",
                  "data": [
                    {
                      "med_order_id": "889599",
                      "x": 1266048000000,
                      "x2": 1785853504597,
                      "y": 1,
                      "name": "famotidine 20 mg po tabs",
                      "color": "lightgreen",
                      "pcat": "Community"
                    }
                  ],
                  "syndromes": "",
                  "med_order_ids": [
                    "889599"
                  ],
                  "medId": "https://apporchard.epic.com/interconnect-aocurprd-oauth/api/FHIR/STU3/Medication/e4a358bdlVtjl8Jqsf3-8u-DpWQVe6lF9iRbDkfc3qzqImMfALFq9SgOUzo89R5L43",
                  "pcat": "Community",
                  "routes": "Oral",
                  "last_used": "08/04/2026",
                  "last_used_long": 1785853504597,
                  "first_used": "02/13/2010",
                  "first_used_long": 1266048000000,
                  "rxCodes": [
                    "4278",
                    "310273"
                  ],
                  "thera_class": "GASTROINTESTINAL",
                  "pharma_class": "HISTAMINE H2-RECEPTOR INHIBITORS",
                  "ingredient": "famotidine"
                }
              ],
              "name": "Medications",
              "id": "medications",
              "nextUrl": "/MedicationStatement?effective=ge2011-08-03&effective=le2021-08-16&status=active,completed,stopped,on-hold&_include=MedicationStatement:medication&patient=e7uurjqx-qWSveUWOXHBkNQ3&_count=5&sessionID=09-C2F9CB2EF52F11EBA0A40050568B7BE6"
            },
            {
              "start_time": 1628087105618,
              "end_time": 1628087105618,
              "start_time_yyyymmdd": null,
              "end_time_yyyymmdd": null,
              "enc_pat_id": "e7uurjqx-qWSveUWOXHBkNQ3",
              "syndrome": null,
              "cats": [
                {
                  "name": "acetaminophen-codeine 300-30 mg po tabs",
                  "data": [
                    {
                      "med_order_id": "889616",
                      "x": 1242802800000,
                      "x2": 1785853505618,
                      "y": 0,
                      "name": "acetaminophen-codeine 300-30 mg po tabs",
                      "color": "lightgreen",
                      "pcat": "Community"
                    }
                  ],
                  "syndromes": "",
                  "med_order_ids": [
                    "889616"
                  ],
                  "medId": "https://apporchard.epic.com/interconnect-aocurprd-oauth/api/FHIR/STU3/Medication/ebYiUvEmAflK.4LtZVebjlqtNv79DLP0Qug.KhlrlyOho1czxYM9UItdVVQfRlkej3",
                  "pcat": "Community",
                  "routes": "Oral",
                  "last_used": "08/04/2026",
                  "last_used_long": 1785853505618,
                  "first_used": "05/20/2009",
                  "first_used_long": 1242802800000,
                  "rxCodes": [
                    "161",
                    "2670",
                    "817579",
                    "993781"
                  ],
                  "thera_class": "ANALGESICS",
                  "pharma_class": "OPIOID ANALGESIC AND NON-SALICYLATE ANALGESICS",
                  "ingredient": "acetaminophen,codeine"
                }
              ],
              "name": "Medications",
              "id": "medications",
              "nextUrl": "/MedicationStatement?effective=ge2011-08-03&effective=le2021-08-16&status=active,completed,stopped,on-hold&_include=MedicationStatement:medication&patient=e7uurjqx-qWSveUWOXHBkNQ3&_count=5&sessionID=09-C3957B8CF52F11EBA0A40050568B7BE6"
            },
            {
              "start_time": 1628087106624,
              "end_time": 1628087106624,
              "start_time_yyyymmdd": null,
              "end_time_yyyymmdd": null,
              "enc_pat_id": "e7uurjqx-qWSveUWOXHBkNQ3",
              "syndrome": null,
              "cats": [
                {
                  "name": "levothyroxine sodium 100 mcg po tabs",
                  "data": [
                    {
                      "med_order_id": "889600",
                      "x": 1266048000000,
                      "x2": 1785853506624,
                      "y": 0,
                      "name": "levothyroxine sodium 100 mcg po tabs",
                      "color": "lightgreen",
                      "pcat": "Community"
                    }
                  ],
                  "syndromes": "",
                  "med_order_ids": [
                    "889600"
                  ],
                  "medId": "https://apporchard.epic.com/interconnect-aocurprd-oauth/api/FHIR/STU3/Medication/eA9IZM.lvQVOXTDPYrt97mqyOk-nP.8P-1WyJLwV2PDApPnmXtYuOAwtCA2vBEcqM3",
                  "pcat": "Community",
                  "routes": "Oral",
                  "last_used": "08/04/2026",
                  "last_used_long": 1785853506624,
                  "first_used": "02/13/2010",
                  "first_used_long": 1266048000000,
                  "rxCodes": [
                    "10582",
                    "40144",
                    "892246",
                    "1372638"
                  ],
                  "ingredient": "levothyroxine"
                }
              ],
              "name": "Medications",
              "id": "medications",
              "nextUrl": "/MedicationStatement?effective=ge2011-08-03&effective=le2021-08-16&status=active,completed,stopped,on-hold&_include=MedicationStatement:medication&patient=e7uurjqx-qWSveUWOXHBkNQ3&_count=5&sessionID=09-C42DCC20F52F11EBA0A40050568B7BE6"
            },
            {
              "start_time": 1628087107611,
              "end_time": 1628087107611,
              "start_time_yyyymmdd": null,
              "end_time_yyyymmdd": null,
              "enc_pat_id": "e7uurjqx-qWSveUWOXHBkNQ3",
              "syndrome": null,
              "cats": [
                {
                  "name": "diltiazem hcl er coated beads 240 mg po cp24",
                  "data": [
                    {
                      "med_order_id": "889601",
                      "x": 1266048000000,
                      "x2": 1785853507611,
                      "y": 0,
                      "name": "diltiazem hcl er coated beads 240 mg po cp24",
                      "color": "lightgreen",
                      "pcat": "Community"
                    }
                  ],
                  "syndromes": "",
                  "med_order_ids": [
                    "889601"
                  ],
                  "medId": "https://apporchard.epic.com/interconnect-aocurprd-oauth/api/FHIR/STU3/Medication/eAMyTcggmIulnQ2tTBjDzeBvrUMvvs73LjpnaBVzXDkTlUN-avGintCN5sX-Od95I3",
                  "pcat": "Community",
                  "routes": "Oral",
                  "last_used": "08/04/2026",
                  "last_used_long": 1785853507611,
                  "first_used": "02/13/2010",
                  "first_used_long": 1266048000000,
                  "rxCodes": [
                    "3443",
                    "203211",
                    "830837"
                  ],
                  "ingredient": "diltiazem"
                }
              ],
              "name": "Medications",
              "id": "medications"
            }
          ] ;
    }
}
