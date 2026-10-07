const mongoose = require('mongoose');

const OLD_PUBLIC_EMAIL = 'info@savemax.com';
const OLD_SUPPORT_EMAIL = 'support@savemax.com';
const NEW_EMAIL = 'contact@savemax.ro';

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  try {
    const organizations = mongoose.connection.db.collection('organizations');
    const settings = mongoose.connection.db.collection('saassettings');

    const organizationEmail = await organizations.updateMany(
      { email: OLD_PUBLIC_EMAIL },
      { $set: { email: NEW_EMAIL } },
    );
    const websiteEmail = await organizations.updateMany(
      { 'settings.email': OLD_PUBLIC_EMAIL },
      { $set: { 'settings.email': NEW_EMAIL } },
    );
    const supportEmail = await settings.updateMany(
      { supportEmail: OLD_SUPPORT_EMAIL },
      { $set: { supportEmail: NEW_EMAIL } },
    );

    console.log(JSON.stringify({
      organizationEmail: organizationEmail.modifiedCount,
      websiteEmail: websiteEmail.modifiedCount,
      supportEmail: supportEmail.modifiedCount,
    }));
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
