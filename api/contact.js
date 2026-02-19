const nodemailer = require('nodemailer')

module.exports = async function handler(req, res) {
  const configuredOrigin = (process.env.CORS_ORIGIN || 'https://khizarhayat2.vercel.app').replace(/\/$/, '')
  const allowedOrigins = [configuredOrigin, `${configuredOrigin}/`]
  const requestOrigin = req.headers.origin || ''
  const originToUse = allowedOrigins.includes(requestOrigin) ? requestOrigin : configuredOrigin

  const mailUser = process.env.MAIL_USER
  const mailPass = process.env.MAIL_PASS
  const mailTo = process.env.MAIL_TO || mailUser

  // CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', originToUse)
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  if (!mailUser || !mailPass) {
    return res.status(500).json({ message: 'Server configuration error.' })
  }

  try {
    const { name, email, message } = req.body || {}

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email and message are required.' })
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email.' })
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: mailUser,
        pass: mailPass,
      },
    })

    await transporter.sendMail({
      from: mailUser,
      to: mailTo,
      replyTo: email,
      subject: `New Contact Request from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    })

    return res.status(200).json({ message: 'Message sent successfully.' })
  } catch (error) {
    console.error('Contact API error:', error)
    return res.status(500).json({ message: 'Server error. Please try again in a moment.' })
  }
}