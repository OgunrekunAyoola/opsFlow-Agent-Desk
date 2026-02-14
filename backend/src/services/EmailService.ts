export type EmailMessage = {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
};

export type EmailResult = {
  status: 'sent' | 'queued' | 'failed';
  provider?: string;
  error?: string;
  providerMessageId?: string;
};

export class EmailService {
  private provider: 'postmark' | 'resend' | 'sendgrid' | 'mock';
  private from: string;
  constructor() {
    if (process.env.POSTMARK_API_TOKEN) this.provider = 'postmark';
    else if (process.env.RESEND_API_KEY) this.provider = 'resend';
    else if (process.env.SENDGRID_API_KEY) this.provider = 'sendgrid';
    else this.provider = 'mock';
    this.from = process.env.EMAIL_FROM || 'no-reply@opsflow.test';
  }

  async send(message: EmailMessage): Promise<EmailResult> {
    if (this.provider === 'mock') {
      return { status: 'sent', provider: 'mock' };
    }
    if (this.provider === 'resend') {
      const payload = {
        from: message.from || this.from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
      };
      try {
        const res = await this.resendRequest('/emails', payload);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          let providerMessageId: string | undefined;
          try {
            const parsed = JSON.parse(res.body || '{}');
            providerMessageId = parsed?.id || parsed?.data?.id;
          } catch {}
          return { status: 'sent', provider: 'resend', providerMessageId };
        }
        return { status: 'failed', provider: 'resend', error: res.body };
      } catch (err: any) {
        return { status: 'failed', provider: 'resend', error: err?.message || 'error' };
      }
    }
    return { status: 'failed', provider: this.provider, error: 'Provider not configured' };
  }

  private async resendRequest(
    path: string,
    data: any,
  ): Promise<{ statusCode: number; body: string }> {
    const https = await import('https');
    const body = JSON.stringify(data);
    const apiKey = process.env.RESEND_API_KEY as string;
    return new Promise((resolve, reject) => {
      const req = https.request(
        {
          hostname: 'api.resend.com',
          path,
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
          },
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on('data', (d) => chunks.push(Buffer.isBuffer(d) ? d : Buffer.from(d)));
          res.on('end', () =>
            resolve({
              statusCode: res.statusCode || 0,
              body: Buffer.concat(chunks).toString('utf8'),
            }),
          );
        },
      );
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }
}
