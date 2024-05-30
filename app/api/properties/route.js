import connectDB from "@/config/database";
import Property from "@/models/Property";
// 5-13-2024 - will move to a separate file later
//import { getServerSession } from "next-auth";
//import { authOptions } from "@/utils/authOptions";
// import the following instead
import { getSessionUser } from "@/utils/getSessionUser";
// 5-14-2024
import cloudinary from "@/config/cloudinary";

// GET /api/properties
export const GET = async (request) => {
  try {
    await connectDB();

    //5-28-2024 - Pagination task - Get the page and pageSize from the query string
    const page = request.nextUrl.searchParams.get("page") || 1;
    // How many items to show on each page
    const pageSize = request.nextUrl.searchParams.get("pageSize") || 6;

    // Calculate the number of items to skip
    const skip = (page - 1) * pageSize;

    // Get the total number of properties. The empty object is for the filter
    const total = await Property.countDocuments({});

    // Modify the following to include the skip and limit
    // const properties = await Property.find({});
    const properties = await Property.find({}).skip(skip).limit(pageSize);

    // 5-28-2024
    const result = {
      total,
      properties,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return new Response("Something went wrong", {
      status: 500,
    });
  }
};

export const POST = async (request) => {
  try {
    // 5-13-2024 - Connect to database
    await connectDB();

    //const session = await getServerSession(authOptions); - Move to getSessionUser.js
    // if (!session) {
    //   return new Response("Unauthorized", {
    //     status: 401,
    //   });
    // }
    //   const userId = session.user.id;

    // 5-13-2024 - These are for using getSessionUser.js
    const sessionUser = await getSessionUser();

    if (!sessionUser || !sessionUser.userId) {
      return new Response("User ID is required", {
        status: 401,
      });
    }

    // Destructure userId from sessionUser
    const { userId } = sessionUser;

    const formData = await request.formData();

    // Access all values from ammenities and images
    const amenities = formData.getAll("amenities");
    const images = formData
      .getAll("images")
      .filter((image) => image.name !== "");

    // Create propertyData object for database
    const propertyData = {
      type: formData.get("type"),
      name: formData.get("name"),
      description: formData.get("description"),
      location: {
        street: formData.get("location.street"),
        city: formData.get("location.city"),
        state: formData.get("location.state"),
        zipcode: formData.get("location.zipcode"),
      },
      beds: formData.get("beds"),
      baths: formData.get("baths"),
      square_feet: formData.get("square_feet"),
      amenities,
      rates: {
        nightly: formData.get("rates.nightly"),
        weekly: formData.get("rates.weekly"),
        monthly: formData.get("rates.monthly"),
      },
      seller_info: {
        name: formData.get("seller_info.name"),
        email: formData.get("seller_info.email"),
        phone: formData.get("seller_info.phone"),
      },
      owner: userId, // 5-13-2024 - Add owner to property
    };

    // Upload images to cloudinary - 5-14-2024
    const imageUploadPromises = []; // Create an array to store promises

    for (const image of images) {
      const imageBuffer = await image.arrayBuffer();
      const imageArray = new Uint8Array(imageBuffer);
      const imageData = Buffer.from(imageArray);
      // For the above three, we turn the image(s) into a data type that cloudinary can read
      // Convert the image data to base64
      const imageBase64 = imageData.toString("base64");

      // Make request to upload to Cloudinary
      const result = await cloudinary.uploader.upload(
        `data:image/png;base64,${imageBase64}`, // This is the format that Cloudinary expects
        {
          folder: "propertypdx", // The folder in Cloudinary
        }
      );
      // Push the promise to the array
      imageUploadPromises.push(result.secure_url); // This is the URL of the image in Cloudinary
    }

    // Wait for all images to upload (promises to resolve)
    const uploadedImages = await Promise.all(imageUploadPromises);

    // Add the images to the propertyData object - This will add the image urls to the MongoDB database
    propertyData.images = uploadedImages;

    //console.log(propertyData);
    const newProperty = new Property(propertyData);
    await newProperty.save();

    return Response.redirect(`${process.env.NEXTAUTH_URL}/properties/${newProperty._id}
    `);

    // return new Response(JSON.stringify({ message: "Success" }), {
    //   status: 200,
    // });
  } catch (error) {
    return new Response("Failed to add property", {
      status: 500,
    });
  }
};
