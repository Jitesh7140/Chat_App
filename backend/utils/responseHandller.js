const response = (res , statusCode , message , data=null)=>{
    if(!res){
        console.error('Response handler error')
        return;
    }

    const responseObject = {
        status:statusCode < 400 ? 'success' : 'error',
        message,
        data
    }

    res.status(statusCode).json(responseObject)

}

module.exports = response