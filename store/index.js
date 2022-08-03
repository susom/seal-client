/* eslint-disable */

export const state = () => ({
    pageTitle: "",
    user : { user_id: "0", full_name: ""},
    patientId: "",
    appId: 0,
    currentApp : {}
})

export const mutations = {
    setPageTitle(state, title) {
        state.pageTitle = title ;
    },
    setPatientId(state, pid) {
        state.patientId = pid ;
    },
    setAppId(state, aid) {
        state.appId = aid ;
    },
    setUser(state, user) {
        state.user = user ;
    },
    setCurrentApp(state, app) {
        state.currentApp = app ;
    }
}

// || state.user.user_id == "S0169406" /* Ron */                    
export const getters = {
    sealTeam(state) {
        return (state.user.user_id == "S0311772" /* SRINI */
                    || state.user.user_id == "S0100197" /* Susan */
                    || state.user.user_id == "S0296837" /* JoeP */                    
                    || state.user.user_id == "SHC" || state.user.user_id == "0")
    }
}

/* eslint-enable */
