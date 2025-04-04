// This file is used to configure the development server
module.exports = function(app) {
  // Suppress hot-update.json 404 warnings in console
  app.use((req, res, next) => {
    if (req.url.includes('.hot-update.json')) {
      res.status(200).json({});
    } else {
      next();
    }
  });
};
