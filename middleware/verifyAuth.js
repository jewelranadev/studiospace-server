import crypto from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";

let JWKS;

const getJWKS = () => {
  const authUrl = process.env.BETTER_AUTH_URL;

  if (!authUrl) {
    throw new Error("BETTER_AUTH_URL is missing");
  }

  if (!JWKS) {
    JWKS = createRemoteJWKSet(new URL(`${authUrl}/api/auth/jwks`));
  }

  return JWKS;
};


const safeEqual = (a, b) => {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
};

export const verifyAuth = async (req, res, next) => {
  try {
   
    const internalKey = req.headers["x-internal-api-key"];

    if (internalKey) {
      const secret = process.env.INTERNAL_API_SECRET;

      if (!secret) {
        console.error("INTERNAL_API_SECRET is missing on Express server");
        return res.status(500).json({
          success: false,
          message: "Authentication configuration missing",
        });
      }

      if (!safeEqual(internalKey, secret)) {
        return res.status(401).json({
          success: false,
          message: "Invalid internal API key",
        });
      }

      const email = req.headers["x-user-email"];

      if (!email) {
        return res.status(401).json({
          success: false,
          message: "Missing user identity",
        });
      }

      let name = email;
      try {
        const rawName = req.headers["x-user-name"];
        if (rawName) name = decodeURIComponent(rawName);
      } catch {
        // Ignore decode errors
      }

      req.user = {
        id: req.headers["x-user-id"] || email,
        email,
        name,
      };

      return next();
    }

    const authUrl = process.env.BETTER_AUTH_URL;

    if (!authUrl) {
      return res.status(500).json({
        success: false,
        message: "Authentication configuration missing",
      });
    }

    const cookieHeader = req.headers.cookie || "";

    const cookies = Object.fromEntries(
      cookieHeader
        .split(";")
        .filter(Boolean)
        .map((cookie) => {
          const [name, ...value] = cookie.trim().split("=");
          return [name, decodeURIComponent(value.join("="))];
        })
    );

    const cookieName = Object.keys(cookies).find((name) =>
      name.endsWith("session_data")
    );

    const token = cookieName ? cookies[cookieName] : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login.",
      });
    }

    const { payload } = await jwtVerify(token, getJWKS(), {
      issuer: authUrl,
      audience: authUrl,
    });

    const user = payload.user;

    if (!user?.email) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    req.user = {
      id: user.id || payload.sub,
      email: user.email,
      name: user.name || user.email,
    };

    next();
  } catch (error) {
    console.error("Auth verification failed:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
};