import {
  registerUser,
  loginUser,
  refreshUsersSession,
  logoutUser,
} from '../services/auth.js';
import { THIRTY_DAYS } from '../constants/index.js';

export const registerUserController = async (req, res, next) => {
  try {
    const newUser = await registerUser(req.body);
    const userObject = newUser.toObject();

    delete userObject.password;

    res.status(201).json({
      status: 'success',
      message: 'Successfully registered a user!',
      data: userObject,
    });
  } catch (err) {
    next(err);
  }
};

export const loginUserController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken } = await loginUser(email, password);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      expires: new Date(Date.now() + THIRTY_DAYS),
    });

    res.status(200).json({
      status: 'success',
      message: 'Successfully logged in an user!',
      data: { accessToken },
    });
  } catch (err) {
    next(err);
  }
};

const setupSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });
};

export const refreshUserSessionController = async (req, res) => {
  const session = await refreshUsersSession({
    sessionId: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  setupSession(res, session);

  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const logoutUserController = async (req, res) => {
  if (req.cookies.sessionId) {
    await logoutUser(req.cookies.sessionId);
  }

  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');

  res.status(204).send();
};
