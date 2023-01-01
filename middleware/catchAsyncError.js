export const catchAsyncError = (passedfunction) => {
    return (req,res,next) =>{  // return a function 
        Promise.resolve(passedfunction(req,res,next)).catch(next);
    }
}