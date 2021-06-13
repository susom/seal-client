export default class SealAPI {
    
    constructor ($axios) {
        this.axios = $axios
    }

    dblog(activity, mesg, appId) {
        this.axios.post("/fhir-app/api/v1/dblog?aid=" + appId, { "act": activity, "mesg" : mesg}) ;
    }
    
    feedback(data, patientId, appId) {
        return this.axios
            .post("/fhir-app/api/v1/feedback?aid=" + appId + "&pid=" + patientId, data)
            .then( (response) => { 
                return response.data ;
            }) ;
    }
}
