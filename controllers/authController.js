
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Register a new user. Expects:
 *   {
 *     role: 'client' | 'taxidriver',
 *     fullName: string,
 *     email: string,
 *     password: string,
 *     phoneNumber: string,        // <-- must match schema
 *     // if role === 'taxidriver', also:
 *     licenseNumber: string,
 *     plateNumber: string,
 *     vehicleModel: string
 *   }
 */

// Helper to generate a unique Taxi ID
const generateTaxiId = () => {
  return 'TAXI-' + Math.random().toString(36).substr(2, 6).toUpperCase();
};

const register = async (req, res) => {
  try {
    const {
      role,
      fullName,
      email,
      password,
      phoneNumber,
      licenseNumber,
      plateNumber,
      vehicleModel,
    } = req.body;

    // 1) Check for existing email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ errors: ['Email already in use'] });
    }

    // 2) Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3) Build new user payload
    const newUserData = {
      role,
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
    };

    // If taxi driver, attach those fields
    if (role === 'taxidriver') {
      newUserData.licenseNumber = licenseNumber;
      newUserData.vehiclePlate = plateNumber;
      newUserData.vehicleModel = vehicleModel;
      newUserData.taxiId = generateTaxiId();
    }

    // 4) Save to DB
    const newUser = new User(newUserData);
    await newUser.save();

    // 5) Sign JWT and return
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(201).json({
      token,
      role: newUser.role,
      taxiId: newUser.taxiId || null,
      fullName: newUser.fullName,
      email: newUser.email,
    });

  } catch (err) {
    console.error('Registration error:', err);
    return res
      .status(500)
      .json({ errors: ['Server error during registration'] });
  }
};



/**
 * Login existing user. Expects:
 *   {
 *     email: string,
 *     password: string
 *   }
 * Returns: { token, role }
 */
const login = async (req, res) => {
  try {
    console.log('>>> [LOGIN] req.body =', req.body);
    const { email, password, role } = req.body;
    // 1) Find user by email
    const user = await User.findOne({ email, role });
   if (!user) {
  return res
    .status(400)
    .json({ errors: ['Invalid credentials or role mismatch'] });
}

     // 🚫 Ban check
   if (user.isBanned) {
  return res
    .status(403)
    .json({ errors: ['Your account has been banned.'] });
}

    // 2) Compare password
    const isMatch = await bcrypt.compare(password, user.password);
   if (!isMatch) {
  return res
    .status(400)
    .json({ errors: ['Invalid credentials'] });
}


    // 3) Sign JWT with role
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({ token, role: user.role });
  } catch (err) {
    console.error('Login error:', err);
   return res
  .status(500)
  .json({ errors: ['Server error during login'] });
  }
};

module.exports = { register, login };
