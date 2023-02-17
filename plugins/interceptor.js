export default (ctx) => {
    ctx.$axios.onError((error) => {
      console.log("error in axios call") ;
      console.log(error) ;
      const errorMsg = error.response ? error.response.data.message : 'Unknown error' ;
      const errorCode = error.response ? parseInt(error.response.status) : -1 ;
      // redirect it to app home page for Unauthorized calls
      if (errorCode === 401) {
        console.log(errorCode + ' - ' + errorMsg)
        ctx.redirect('/')
      } else {
        throw new Error(error)        
      }
    })
  }