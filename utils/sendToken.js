export const sendToken = (res, user, message, statusCode = 200) => {
  const token = user.getJWTToken();

  const options = {
    expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    httpOnly: true, // prevents client-side scripts from accessing data only store cookie in http (server side)
    secure: true, // secure attribute is to prevent cookies from being observed by unauthorized parties due to the transmission of the cookie in clear text
    sameSite: "none",
  };
 
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    message,
    user,
  });
};
