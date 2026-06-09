import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { upload } from "../middlewares/multer.middleware.js";
import { ApiResponse } from "../utils/ApiResponse.js";



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




    const { fullName, email, username, password } = req.body

    console.log("email: ", email);

    // if (fullName == "") {
    //     throw new ApiError(400, "fullname is required")
    // }
    //  above method is beginner level to check all the validation


    //now new method

    if(
        [fullName, email, username, password].some((field)=> field?.trim()=== "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })
    f
    if(existedUser){
        throw new ApiError(409, " User with name or username is already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required" )
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage: coverImage.url || "", // cover image is not checked above thay we get cover image or not so that is why or condition is there
        email,
        password,
        username: username.toLowercase()

    })

    // to checck user is registered or not like registration completed or not

    const createsUser = await User.findById(user._id).select(
        "-password -refreshToken"
    ) 

    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createsUser, "User registered Successfullyy")
    )

})

export { registerUser } 