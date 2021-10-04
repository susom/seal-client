
/**
 * Set the axios base URL based on the server where it is loaded from
 * @param {axios instance} param0 
 */
export default function ({ $axios }) {
    if (process.client) {
        const protocol = window.location.protocol
        const hostname = window.location.hostname
        if (hostname == 'localhost') 
            $axios.defaults.baseURL = "https://localhost:8000" ;
        else
            $axios.defaults.baseURL = `${protocol}//${hostname}` ;
    }
}
