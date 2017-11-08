import jwt from 'jsonwebtoken'

export default {
  verifyToken (token) {
    try {
      const payload = jwt.verify(token, process.env.TOKEN_SECRET);
      return payload;
    } catch (e) {
      if (e.name === 'JsonWebTokenError') {
        console.error('Token invalide.');
      }
      if (e.name === 'TokenExpiredError') {
        console.error('Token expiré.');
      }
    }
  }
}
