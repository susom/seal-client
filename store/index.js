/* eslint-disable */

export const state = () => ({
    pageTitle: "",
    user : { user_id: 0, full_name: ""},
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

export const getters = {

}

/* eslint-enable */
