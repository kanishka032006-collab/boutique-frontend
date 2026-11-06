const address = 'Door No. 4/77/A, Happy Down, Salaiyar, Nandhavanapatty, Old Karur Road, Dindigul - 624 005';
const whatsappNumber = '919344149236';
const whatsappMessage = 'Hello VEDHIKA BRAND, I have an enquiry about bulk and bridal gifting.';

export const contactInfo = {
  email: 'concierge@vedhika.co.in',
  phones: [
    { display: '+91 93441 49236', tel: '+919344149236' },
    { display: '+91 93604 35871', tel: '+919360435871' },
  ],
  address,
  directionsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
  whatsappUrl: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`,
  hours: [
    'Monday - Saturday: 10:00 AM - 8:00 PM',
    'Sunday: By appointment only',
  ],
};
