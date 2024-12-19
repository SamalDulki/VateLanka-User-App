import { auth } from "../utils/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";

// Sign up a user
export const signUpWithEmail = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Send email verification
    await sendEmailVerification(user);
    return user;
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      throw new Error("This email is already registered. Please log in.");
    }
    throw error;
  }
};

// Log in a user
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    if (!user.emailVerified) {
      // Send a new verification email
      await sendEmailVerification(user);
      auth.signOut(); // Sign out the unverified user
      throw new Error(
        "Please verify your email before logging in. A new verification email has been sent."
      );
    }

    return user;
  } catch (error) {
    // First check if it's our verification error
    if (error.message.includes("Please verify your email")) {
      throw error;
    }

    // Handle Firebase auth errors
    if (
      error.code === "auth/invalid-login-credentials" ||
      error.code === "auth/invalid-email" ||
      error.code === "auth/wrong-password" ||
      error.code === "auth/user-not-found"
    ) {
      throw new Error("Invalid email or password.");
    }

    // If it's any other error, throw the original error
    throw error;
  }
};

// Send password reset email
export const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw new Error(
      "Failed to send reset email. Please check your email address."
    );
  }
};

// Resend verification email
export const resendVerificationEmail = async (user) => {
  try {
    await sendEmailVerification(user);
  } catch (error) {
    throw new Error(
      "Failed to resend verification email. Please try again later."
    );
  }
};
