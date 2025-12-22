export const getEmailTemplate = (
  title: string,
  bodyContent: string,
  ctaLink?: string,
  ctaText?: string,
) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f9fafb;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <!-- Header -->
        <div style="background-color: #000000; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">xCardGen</h1>
        </div>
        
        <!-- Body -->
        <div style="padding: 40px 32px;">
            <h2 style="margin-top: 0; color: #111827; font-size: 20px;">${title}</h2>
            
            <div style="color: #4b5563; font-size: 16px;">
                ${bodyContent}
            </div>

            ${
              ctaLink
                ? `
            <div style="margin-top: 32px; text-align: center;">
                <a href="${ctaLink}" style="background-color: #7c3aed; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
                    ${ctaText || 'View Dashboard'}
                </a>
            </div>
            `
                : ''
            }
            
            <div style="margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 24px; font-size: 14px; color: #6b7280;">
                <p>Need help? Reply to this email or visit our <a href="${process.env.FRONTEND_URL}/help" style="color: #7c3aed; text-decoration: none;">Help Center</a>.</p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f3f4f6; padding: 24px; text-align: center; font-size: 12px; color: #9ca3af;">
            <p>&copy; ${new Date().getFullYear()} xCardGen. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;
