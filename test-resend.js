// Test script with verified domain
const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');

envLines.forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        process.env[key] = value;
    }
});

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
    console.log('🔍 Testing Resend with verified domain...\n');

    if (!process.env.RESEND_API_KEY) {
        console.error('❌ RESEND_API_KEY not found');
        return;
    }

    console.log('✅ API Key found\n');

    try {
        // IMPORTANT: Change this to the email you want to test
        const testRecipient = 'a.vargas@mrvargas.co';

        console.log(`📧 Sending test email to: ${testRecipient}`);
        console.log(`📤 From: reservas@laherreria.co\n`);

        const data = await resend.emails.send({
            from: 'Hacienda La Herrería <reservas@laherreria.co>',
            to: testRecipient,
            subject: 'Prueba - Confirmación de Reserva',
            html: `
                <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <h1 style="color: #059669;">✅ Email de Prueba</h1>
                    <p>Si recibes este correo, significa que:</p>
                    <ul>
                        <li>✅ El dominio laherreria.co está verificado</li>
                        <li>✅ Resend está funcionando correctamente</li>
                        <li>✅ Los correos de confirmación llegarán a tus clientes</li>
                    </ul>
                    <p><strong>Próximo paso:</strong> Confirma una reserva desde el panel de admin!</p>
                </div>
            `
        });

        console.log('✅ Email sent successfully!');
        console.log('📬 Email ID:', data.id || 'N/A');
        console.log('\n🎉 Check your inbox!\n');
        console.log('💡 If you don\'t see it:');
        console.log('   1. Check SPAM folder');
        console.log('   2. Wait 1-2 minutes');
        console.log('   3. Verify domain is fully verified in Resend dashboard\n');

    } catch (error) {
        console.error('❌ Error sending email:\n');
        console.error('Message:', error.message);

        if (error.message.includes('domain') || error.message.includes('not verified')) {
            console.log('\n⚠️  DOMAIN NOT VERIFIED');
            console.log('📝 Steps to verify:');
            console.log('   1. Go to https://resend.com/domains');
            console.log('   2. Check if laherreria.co shows as "Verified"');
            console.log('   3. If not, add the DNS records provided by Resend');
            console.log('   4. Wait 5-30 minutes for DNS propagation\n');
        }

        console.log('\nFull error:');
        console.log(error);
    }
}

testEmail();
