 const asyncHandler = (requestHandler) =>{
    (req, res, next)=> {
        Promise.resolve(requestHandler(req, res, next)).catch((err)=> next(err))
    }
 }


//  above step is optimised and tougher one too

export {asyncHandler}


// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = () => async () => {}



//  method below is for beginner and all but does the same thing that above asyncHandler is doing 

// const asyncHandler = (fn) =>async(req, res, next)=> {
//     try{
//         await fn(req, res, next)
//     } catch (error) {
     
//         res.status(error.code || 500).json({
//             success:false,
//             message: error.message
//         })
//     }
// }