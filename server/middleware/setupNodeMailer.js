const nodemailer = require("nodemailer");

module.exports = async (req, res, next) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "alec.reinger@ethereal.email",
        pass: "Y7mz5breXSeUDfsEJK",
      },
    });
    req.transporter = transporter;
    next();
  } catch (error) {
    console.log(error);
    res.send("ERROR: ", error);
  }
};
