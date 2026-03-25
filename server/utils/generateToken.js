import jwt from 'jsonwebtoken';

export const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

export const generateVerificationToken = () => {
    return jwt.sign({ type: 'verification' }, process.env.JWT_SECRET, {
        expiresIn: '24h'
    });
};

export const generateResetToken = () => {
    return jwt.sign({ type: 'reset' }, process.env.JWT_SECRET, {
        expiresIn: '1h'
    });
};
