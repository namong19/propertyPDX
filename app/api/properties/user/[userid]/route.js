import connectDB from "@/config/database";
import Property from "@/models/Property";

// 5-17-2024
// GET /api/properties/user/:userId
// Added {params} in order to get the dynamic userId
export const GET = async (request, { params }) => {
  try {
    await connectDB();

    // 5-17-2024 - Get the userId from the params
    const userId = params.userid;

    if (!userId) {
      return new Response("User ID is required", {
        status: 400,
      });
    }

    const properties = await Property.find({ owner: userId });

    return new Response(JSON.stringify(properties), {
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return new Response("Something went wrong", {
      status: 500,
    });
  }
};
