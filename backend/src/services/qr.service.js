const QRCode = require('qrcode');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const generateQR = async (assetCode) => {
  const url = `${FRONTEND_URL}/asset/scan/${assetCode}`;
  try {
    const base64 = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' },
    });
    return base64;
  } catch (err) {
    throw { statusCode: 500, message: 'Failed to generate QR code' };
  }
};

module.exports = { generateQR };
