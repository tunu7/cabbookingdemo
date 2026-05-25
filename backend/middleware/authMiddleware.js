import jwt from "jsonwebtoken";

export const protect =
  async (req, res, next) => {

    try {

      console.log(
        "AUTH HEADERS:",
        req.headers.authorization
      );

      const authHeader =
        req.headers.authorization;

      if (!authHeader) {

        return res
          .status(401)
          .json({
            message:
              "No authorization header",
          });
      }

      const token =
        authHeader.split(" ")[1];

      if (!token) {

        return res
          .status(401)
          .json({
            message:
              "No token provided",
          });
      }

      console.log(
        "TOKEN:",
        token
      );

      const decoded =
        jwt.verify(
          token,
          process.env.JWT_SECRET
        );

      console.log(
        "DECODED:",
        decoded
      );

      req.user = decoded;

      next();

    } catch (error) {

      console.log(
        "AUTH ERROR:"
      );

      console.log(error);

      return res
        .status(401)
        .json({
          message:
            "Unauthorized",
        });
    }
  };