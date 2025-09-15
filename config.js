module.exports = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/christ_mentoring',
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_this_in_production',
  PORT: process.env.PORT || 3000
};


