import A3PainAPI from "~/services/A3PainAPI";
import SealAPI from "~/services/SealAPIService"
import StrokeRiskAPI from "~/services/StrokeRiskAPI"
import WellsCalcAPI from "~/services/WellsCalcAPI"

export default (ctx, inject) => {

  console.log("Context object in plugin") ;
  console.log(ctx );

    const services = {
      seal: new SealAPI(ctx.$axios),
      srcalc: new StrokeRiskAPI(ctx.$axios, ctx.store),
      wellscalc: new WellsCalcAPI(ctx.$axios, ctx.store),
      a3pain: new A3PainAPI(ctx.$axios, ctx.store),
    }
  
    inject('services', services)
}

