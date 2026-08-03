const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const prisma = require("./database");
const logger = require("./logger");

const getGoogleConfig = () => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleCallbackUrl =
    process.env.GOOGLE_CALLBACK_URL ||
    "http://localhost:5000/api/auth/google/callback";

  return {
    googleClientId,
    googleClientSecret,
    googleCallbackUrl,
  };
};

const initGooglePassport = () => {
  const { googleClientId, googleClientSecret, googleCallbackUrl } =
    getGoogleConfig();

  if (!googleClientId || !googleClientSecret) {
    logger.warn(
      "Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment."
    );
    return false;
  }

  if (passport._strategies?.google) {
    return true;
  }

  passport.use(
    "google",
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: googleCallbackUrl,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error("Google account does not have an email"));
          }

          const googleId = profile.id;
          const name = profile.displayName || "Google User";

          let user = await prisma.user.findUnique({
            where: {
              email,
            },
          });

          if (user && !user.googleId) {
            user = await prisma.user.update({
              where: { email },
              data: { googleId },
            });
          }

          if (!user) {
            user = await prisma.user.create({
              data: {
                name,
                email,
                googleId,
                passwordHash: null,
              },
            });
          }

          return done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );

  return true;
};

const isGoogleConfigured = () => {
  const { googleClientId, googleClientSecret } = getGoogleConfig();
  return Boolean(
    googleClientId && googleClientSecret && passport._strategies?.google
  );
};

initGooglePassport();

module.exports = {
  isGoogleConfigured,
  getGoogleConfig,
};
