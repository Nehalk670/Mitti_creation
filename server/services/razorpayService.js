import Razorpay from 'razorpay';

// Initialize Razorpay only if keys are provided
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
}

// Create Razorpay order
export const createRazorpayOrder = async (amount, currency = 'INR', receipt = null) => {
    if (!razorpay) {
        return {
            success: false,
            error: 'Razorpay not configured'
        };
    }

    try {
        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency,
            receipt: receipt || `receipt_${Date.now()}`,
            payment_capture: 1
        };

        const order = await razorpay.orders.create(options);
        return {
            success: true,
            order
        };
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Verify Razorpay payment
export const verifyRazorpayPayment = (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
    if (!process.env.RAZORPAY_KEY_SECRET) {
        return {
            success: false,
            message: 'Razorpay not configured'
        };
    }

    try {
        const crypto = require('crypto');
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            return {
                success: true,
                message: 'Payment verified successfully'
            };
        } else {
            return {
                success: false,
                message: 'Invalid payment signature'
            };
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        return {
            success: false,
            message: 'Payment verification failed'
        };
    }
};

// Get payment details
export const getPaymentDetails = async (paymentId) => {
    try {
        const payment = await razorpay.payments.fetch(paymentId);
        return {
            success: true,
            payment
        };
    } catch (error) {
        console.error('Get payment details error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};
