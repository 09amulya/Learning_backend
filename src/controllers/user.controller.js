import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { upload } from "../middlewares/multer.middleware.js";
import { ApiResponse } from "../utils/ApiResponse.js";



const generateAccessAndRefreshTokens = async(userID)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        // generate access or refresh token are methods thats why using parentthesis

        // now what is parentthesis?


        user.refreshToken = refreshToken
       await user.save({validateBeforeSave: false}) 

       return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}


const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend 

    // validation - atleast not empty
    // check if user already exists: username or email
    // check for images check for avatar
    // upload them to cloudinary
    // create user object- create entry in db
    // remove password and refresh token field from reponse
    // check for user creation 
    // return response


    // console.log("BODY => ", req.body);
    // console.log("FILES => ", req.files);


    const { fullName, email, username, password } = req.body

    //console.log("email: ", email);

    // if (fullName == "") {
    //     throw new ApiError(400, "fullname is required")
    // }
    //  above method is beginner level to check all the validation


    //now new method

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    //console.log("COUNT =>", await User.countDocuments())


    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    //console.log("EXISTED USER =>", existedUser)

    if (existedUser) {
        throw new ApiError(409, " User with name or username is already exists")
    }
    //console.log(req.files)

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    // console.log("AVATAR => ", avatar)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage.url || "", // cover image is not checked above thay we get cover image or not so that is why or condition is there
        email,
        password,
        username: username.toLowerCase()

    })


    // to checck user is registered or not like registration completed or not

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfullyy")
    )

})


// now for the login of the user

const loginUser = asyncHandler(async (req, res) => {

    // req body -> data
    // username or email
    // find the user
    // password check
    // access and refresh token
    // send cookie


    const { email, username, password } = req.body

    if (!username || !email) {
        throw new ApiError(400, "username or password is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password) 

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials")
    }


   const {accessToken, refreshToken} =  await generateAccessAndRefreshTokens(user._id)

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken") // this is used to exclude selected things ... ki ye naa aaye


   // now we have to send cookies

   const options = {
    httpOnly: true,
    secure: true
   }

   return res
   .status(200)
   .cookie("accessToken", accessToken , options)
   .cookie("refreshToken", refreshToken , options)
   .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken,
                refreshToken
                // hum again refresh and accesstoken  ko bhej rhe haii jabki already cookies me bhej diye haii ...lekin this one is for the case when user want to save refresh and access token from their side then this will help .....this is not  a good practice but when user want to save token in their local storage so for that case
            },
            "User logged in Successfullyy"
        ) 
   )

})


// log out of the user

const logoutUser = asyncHandler(async(req, res)=>{
    User.findByIdAndUpdate(
       req.user._id,
       {
        $set: {
            refreshToken: undefined 
        }
       },
       {
        new: true
       }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"))

})


export {
    registerUser,
    loginUser,
    logoutUser
} 