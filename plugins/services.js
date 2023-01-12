import A3PainAPI from "~/services/A3PainAPI";
import SealAPI from "~/services/SealAPIService"
import StrokeRiskAPI from "~/services/StrokeRiskAPI"
import WellsCalcAPI from "~/services/WellsCalcAPI"
import MedReviewAPI from "~/services/MedReviewAPI"
import DashboardAPI from "~/services/DashboardAPI";
import TrueImageAPI from "~/services/TrueImageAPI";
import StandingOrdersAPI from "~/services/StandingOrdersAPI";
import AredsCalcAPI from "~/services/AredsCalcAPI";
import AntiMicrobialAPI from "~/services/AntiMicrobialAPI";
import SynopsisAPI from "~/services/SynopsisAPI";
import VisitSummaryAPI from "~/services/VisitSummaryAPI";

export default (ctx, inject) => {

  console.log("Context object in plugin") ;
  console.log(ctx );

    const services = {
      seal: new SealAPI(ctx.$axios, ctx.store),
      srcalc: new StrokeRiskAPI(ctx.$axios, ctx.store),
      wellscalc: new WellsCalcAPI(ctx.$axios, ctx.store),
      a3pain: new A3PainAPI(ctx.$axios, ctx.store, ctx.$moment),
      medreview: new MedReviewAPI(ctx.$axios, ctx.store),
      dashboard: new DashboardAPI(ctx.$axios, ctx.store),
      trueimage: new TrueImageAPI(ctx.$axios, ctx.store),
      standingorders: new StandingOrdersAPI(ctx.$axios, ctx.store),
      aredscalc: new AredsCalcAPI(ctx.$axios, ctx.store),
      antimicrobial: new AntiMicrobialAPI(ctx.$axios, ctx.store),
      synopsis: new SynopsisAPI(ctx.$axios, ctx.store),
      visitsummary: new VisitSummaryAPI(ctx.$axios, ctx.store)
    }
  
    inject('services', services)
}
