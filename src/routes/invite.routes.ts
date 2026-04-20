import { Router, Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/admin/send-invites:
 *   post:
 *     summary: Send bulk email invites using Brevo SMTP
 *     tags: [Admin Actions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emails
 *             properties:
 *               emails:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Invites sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     sent:
 *                       type: array
 *                       items:
 *                         type: string
 *                     failed:
 *                       type: array
 *                       items:
 *                         type: string
 */
router.post('/send-invites', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { emails } = req.body;
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
       res.status(400).json({ success: false, error: 'Please provide an array of emails.' });
       return;
    }

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
       res.status(500).json({ success: false, error: 'SMTP credentials are not fully configured in the environment.' });
       return;
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      tls: {
          rejectUnauthorized: false
      }
    });

    const sent: string[] = [];
    const failed: string[] = [];

    const subject = "You're Invited — PASC CCA Closed Review";
    const siteUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const body = `You have been selected for the PASC CCA closed review. Please use this link to access the platform: ${siteUrl}. This is an invite-only access.`;

    const promises = emails.map(async (email) => {
      try {
        await transporter.sendMail({
          from: SMTP_FROM,
          to: email,
          subject: subject,
          text: body,
        });
        sent.push(email);
      } catch (err) {
        console.error(`Failed to send to ${email}:`, err);
        failed.push(email);
      }
    });

    await Promise.allSettled(promises);

    res.status(200).json({
      success: true,
      data: {
        sent,
        failed,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Bulk invite failed',
    });
  }
});

export default router;
