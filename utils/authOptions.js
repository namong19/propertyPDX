// 5-11-2024
import connectDB from "@/config/database";
import User from "@/models/User";

import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    // Invoke on successful sign in
    async signIn({ profile }) {
      // 1. Connect to the database
      await connectDB();

      // 2. Check if the user exists in the database, by email
      const userExists = await User.findOne({ email: profile.email });

      // 3. If not, then add the user to the database
      if (!userExists) {
        // Truncate the name to 20 characters if too long
        const username = profile.name.slice(0, 20);
        await User.create({
          email: profile.email,
          username,
          image: profile.picture,
        });
      }

      // 4. Return true to allow sign in
      return true;
    },
    // Modify the session object
    async session({ session }) {
      // 1. Get the user from the database
      const user = await User.findOne({ email: session.user.email });

      // 2. Assign the user id to the session
      session.user.id = user._id.toString();

      // 3. Return the session
      return session;
    },
  },
};
