
import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAnalysisReadyNotification(
  email: string,
  clientName: string,
  analysisType: 'tema_natale' | 'oroscopo' | 'sinastria'
) {
  const typeLabels = {
    tema_natale: 'la tua Mappa Astrale Evolutiva',
    oroscopo: 'il tuo Oroscopo Personalizzato',
    sinastria: 'il vostro Libro dell\'Amore (Sinastria)'
  };

  const label = typeLabels[analysisType];
  const subject = `✨ Valeria ha parlato: ${label} è pronta`;

  const html = `
    <div style="font-family: 'Georgia', serif; background-color: #0a0e1a; color: #f5f0e8; padding: 40px; text-align: center;">
      <div style="max-width: 600px; margin: 0 auto; background-color: rgba(255,255,255,0.05); border: 1px solid #d4a017; border-radius: 20px; padding: 40px;">
        <h1 style="color: #d4a017; font-size: 28px; margin-bottom: 24px;">Ciao ${clientName},</h1>
        <p style="font-size: 18px; line-height: 1.6; margin-bottom: 30px;">
          Le vibrazioni del cosmo si sono cristallizzate. Valeria ha completato l'analisi che le avevi richiesto: 
          <strong style="color: #ffdd00;">${label}</strong> è ora disponibile nel tuo Diario.
        </p>
        <div style="margin-bottom: 40px;">
          <a href="https://valeria-astrologia.it/area-personale" 
             style="background: linear-gradient(135deg, #d4a017, #b8860b); color: #0a0e1a; padding: 16px 32px; border-radius: 30px; text-decoration: none; font-weight: bold; font-family: 'Arial', sans-serif; text-transform: uppercase; letter-spacing: 2px; font-size: 14px;">
            Accedi al tuo Diario →
          </a>
        </div>
        <p style="font-size: 14px; color: rgba(255,255,255,0.4); font-style: italic;">
          "Le stelle inclinano, ma non costringono. Ora tocca a te agire."
        </p>
        <hr style="border: 0; border-top: 1px solid rgba(212,160,23,0.2); margin: 30px 0;">
        <p style="font-size: 12px; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 1px;">
          Valeria, la tua Stella · Astrologia Evolutiva
        </p>
      </div>
    </div>
  `;

  try {
    if (!process.env.RESEND_API_KEY) {
       console.log(`[MAIL SIMULATION] To: ${email}, Subject: ${subject}`);
       return { success: true, simulated: true };
    }

    const { data, error } = await resend.emails.send({
      from: 'Valeria <stelle@valeria-astrologia.it>',
      to: [email],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('[MAIL ERROR]', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('[MAIL CRASH]', err);
    return { success: false, error: err };
  }
}
