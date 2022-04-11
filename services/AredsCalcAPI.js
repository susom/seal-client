import SealAPI from "./SealAPIService";

export default class AredsCalcAPI {
    
    constructor ($axios, $store) {
        this.axios = $axios ;
        this.store = $store ;
        this.APP_ID = 10 ;            
        this.seal = new SealAPI($axios) ;
    }

    dblog(act, msg) {
        this.seal.dblog(act, msg, this.APP_ID) ;
    }
}
