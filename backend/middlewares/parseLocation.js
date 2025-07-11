// middlewares/parseLocation.js

const parseLocation = (req, res, next) => {
  const { lng, lat, college, city, state, district } = req.query;

  // Check for required fields
  if (!lng || !lat || !college || !city || !state) {
    return res.status(400).json({
      error: "Missing required location fields: lng, lat, college, city, state.",
    });
  }

  // Parse and attach to req object
  req.location = {
    coordinates: [parseFloat(lng), parseFloat(lat)],
    college: college.trim(),
    city: city.trim(),
    district: district?.trim() || "", // optional
    state: state.trim(),
  };

  next();
};

module.exports = parseLocation;
