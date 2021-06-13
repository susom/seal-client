export const state = () => ({
    pageTitle: "",
    patientId: "",
    appId: 0
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
    }
}