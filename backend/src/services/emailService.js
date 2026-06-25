const nodemailer = require('nodemailer');

let _transporter = null;

async function getTransporter() {
  if (_transporter) return _transporter;

  if (!process.env.SMTP_HOST) {
    const testAccount = await nodemailer.createTestAccount();
    _transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log('\n📧 Usando Ethereal (e-mail de teste)');
    console.log('   Caixa: https://ethereal.email/messages\n');
    return _transporter;
  }

  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return _transporter;
}

async function sendVerificationEmail(email, name, token) {
  const transporter = await getTransporter();
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const link = `${frontendUrl}/verificar-email?token=${token}`;
  const firstName = name.split(' ')[0];

  // HTML compatível com Outlook/Hotmail — sem gradientes, sem inline-block
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Confirme seu e-mail</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:Arial,Helvetica,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a0a0a;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Card principal -->
        <table width="520" cellpadding="0" cellspacing="0" border="0"
               style="background-color:#111111;border-radius:12px;border:1px solid #222222;">

          <!-- Header dourado -->
          <tr>
            <td align="center" bgcolor="#c9a84c" style="padding:24px 32px;border-radius:12px 12px 0 0;">
              <p style="margin:0;font-size:28px;font-weight:bold;color:#000000;letter-spacing:2px;">
                INACIOS<span style="color:#ffffff;">777</span>
              </p>
              <p style="margin:6px 0 0;font-size:11px;color:#000000;letter-spacing:3px;text-transform:uppercase;">
                Cassino Online
              </p>
            </td>
          </tr>

          <!-- Corpo -->
          <tr>
            <td style="padding:36px 32px;">

              <p style="margin:0 0 8px;font-size:22px;font-weight:bold;color:#ffffff;">
                Olá, ${firstName}!
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#aaaaaa;line-height:1.6;">
                Obrigado por criar sua conta no INACIOS777. Clique no botão abaixo para confirmar
                seu e-mail e liberar acesso completo à plataforma.
              </p>

              <!-- Botão compatível com Outlook/Hotmail -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 28px;">
                <tr>
                  <td align="center" bgcolor="#c9a84c"
                      style="border-radius:8px;padding:0;">
                    <a href="${link}"
                       style="display:block;padding:16px 40px;font-size:17px;font-weight:bold;
                              color:#000000;text-decoration:none;border-radius:8px;
                              font-family:Arial,Helvetica,sans-serif;white-space:nowrap;">
                      ✓ &nbsp;Confirmar E-mail
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:13px;color:#666666;">
                Ou copie e cole este link no navegador:
              </p>
              <p style="margin:0 0 24px;font-size:12px;word-break:break-all;
                         color:#c9a84c;background-color:#1a1a1a;padding:10px 14px;border-radius:6px;">
                ${link}
              </p>

              <p style="margin:0;font-size:12px;color:#555555;line-height:1.6;">
                ⏱ Este link expira em <strong style="color:#aaaaaa;">48 horas</strong>.<br>
                Se não foi você quem se cadastrou, ignore este e-mail.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px 24px;border-top:1px solid #1e1e1e;">
              <p style="margin:0;font-size:11px;color:#444444;text-align:center;">
                © 2026 inacios777 — projeto de demonstração (portfólio)<br>
                Ambiente de demonstração · sem dinheiro real · conteúdo 18+.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || '"INACIOS777" <nao-responda@example.com>',
    to: email,
    subject: '✓ Confirme seu e-mail — INACIOS777',
    html,
    // Texto simples para clientes que não renderizam HTML
    text: `Olá ${firstName},\n\nConfirme seu e-mail clicando no link abaixo:\n\n${link}\n\nO link expira em 48 horas.\n\n© 2026 inacios777 — projeto de demonstração (sem dinheiro real)`,
    headers: {
      'X-Priority': '1',
      'X-Mailer': 'INACIOS777 Mailer',
    },
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`\n📬 Preview: ${previewUrl}\n`);
  } else {
    console.log(`📬 E-mail enviado para ${email}`);
  }

  return info;
}

module.exports = { sendVerificationEmail };
