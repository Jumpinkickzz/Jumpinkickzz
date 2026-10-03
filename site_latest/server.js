const express = require('express');
const path = require('path');
const Stripe = require('stripe');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4242;
const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;

app.use(express.json());
app.use(express.static(__dirname));

// Keep product pricing on the server so the browser cannot change the amount charged.
const PRODUCTS = [
  {id:1,brand:'BALENCIAGA',name:'Runner White / Multicolor',color:'White / Multicolor',price:150,img:'images/catalog_balenciaga_0.jpg'},
  {id:2,brand:'BALENCIAGA',name:'Runner White / Black',color:'White / Black',price:150,img:'images/catalog_balenciaga_1.jpg'},
  {id:3,brand:'BALENCIAGA',name:'Runner White / Black / Silver',color:'Grey / Black / Silver',price:150,img:'images/catalog_balenciaga_2.jpg'},
  {id:4,brand:'BALENCIAGA',name:'Runner White / Black / Silver',color:'Grey / Black / Silver',price:150,img:'images/catalog_balenciaga_3.jpg'},
  {id:5,brand:'DIOR',name:'Dior B30 White / Blue / Grey',color:'White / Blue / Grey',price:120,img:'images/catalog_dior_0.webp'},
  {id:6,brand:'DIOR',name:'Dior B30 Black / White',color:'Black / White',price:120,img:'images/catalog_dior_1.jpg'},
  {id:7,brand:'DIOR',name:'Dior B30 Grey / White',color:'Grey / White',price:120,img:'images/catalog_dior_2.jpg'},
  {id:8,brand:'DIOR',name:'Dior B30 White',color:'White',price:120,img:'images/catalog_dior_3.jpg'},
  {id:29,brand:'DIOR',name:'Dior B30 Alternate',color:'Alternate',price:120,img:'images/catalog_dior_4.webp'},
  {id:9,brand:'SP5DER',name:'Never Mind the Punk Sp5der Hoodie',color:'Black / Pink',price:75,img:'images/sp5der_black_pink.jpg'},
  {id:10,brand:'SP5DER',name:'Sp5der Hoodie "TC Blue"',color:'Blue / Yellow',price:75,img:'images/sp5der_blue.jpg'},
  {id:11,brand:'SP5DER',name:'Sp5der Web Hoodie "Sky Blue"',color:'Sky Blue / White',price:75,img:'images/sp5der_skyblue.jpg'},
  {id:12,brand:'SP5DER',name:'World 555 Hoodie – Red',color:'Red',price:75,img:'images/sp5der_red.jpg'},
  {id:13,brand:'SP5DER',name:'Sp5der Punk V2 Rhinestone Hoodie "Bright Green"',color:'Bright Green / Black / White',price:75,img:'images/sp5der_bright_green.jpg'},
  {id:14,brand:'PURPLE BRAND',name:'P001 Black Resin 3/D',color:'Black',price:188,img:'images/purple_black_resin_3d.jpg'},
  {id:15,brand:'PURPLE BRAND',name:'P001 Black Raw',color:'Black',price:190,img:'images/purple_black_raw.jpg'},
  {id:16,brand:'PURPLE BRAND',name:'P001 Black Overspray',color:'Black',price:118.35,img:'images/purple_black_overspray.jpg'},
  {id:17,brand:'PURPLE BRAND',name:'P001 Worn Grey Knee Slit',color:'Grey',price:132.5,img:'images/purple_worn_grey_knee_slit.jpg'},
  {id:18,brand:'PURPLE BRAND',name:'P001 Light Dirty Wax',color:'Light Indigo',price:198,img:'images/purple_light_dirty_wax.jpg'},
  {id:19,brand:'HELLSTAR',name:'Classic Tribal Print T-Shirt',color:'Black',price:75,img:'images/hellstar_classic_black.webp'},
  {id:20,brand:'HELLSTAR',name:'Hellstar Sports Core Gel Logo T-Shirt',color:'Black/Red',price:75,img:'images/hellstar_user_1.webp'},
  {id:21,brand:'HELLSTAR',name:'H3star T-Shirt',color:'Black',price:75,img:'images/hellstar_user_3.webp'},
  {id:22,brand:'HELLSTAR',name:'Hellstar Sports Core Gel Logo T-Shirt',color:'White/Black',price:75,img:'images/hellstar_sports_white_black_back.webp'},
  {id:23,brand:'HELLSTAR',name:'Jesus Eyes T-Shirt',color:'White',price:75,img:'images/hellstar_jesus_eyes_white.webp'},
  {id:24,brand:'MIKE AMIRI',name:'MX1',color:'Black OD',price:150,img:'images/amiri_mx1_black_od.webp'},
  {id:25,brand:'MIKE AMIRI',name:'MX1 Jean',color:'White',price:150,img:'images/amiri_mx1_white.webp'},
  {id:26,brand:'MIKE AMIRI',name:'MX1 Jean',color:'Rich Indigo',price:150,img:''},
  {id:27,brand:'MIKE AMIRI',name:'Waxed MX1 Jean',color:'Waxed Dusty Black',price:150,img:''},
  {id:28,brand:'MIKE AMIRI',name:'MX1 Jean',color:'Storm Black',price:150,img:''}
];
const byId = new Map(PRODUCTS.map(p => [p.id, p]));


function validateShipping(shipping) {
  const clean = value => typeof value === 'string' ? value.trim().slice(0, 100) : '';
  if (!shipping || !clean(shipping.firstName) || !clean(shipping.lastName) || !clean(shipping.addressLine) || !clean(shipping.city) || !clean(shipping.state) || !/^[0-9]{5}(?:-[0-9]{4})?$/.test(clean(shipping.zip))) {
    throw new Error('Please provide a complete U.S. shipping address.');
  }
  return {
    firstName: clean(shipping.firstName), lastName: clean(shipping.lastName),
    addressLine: clean(shipping.addressLine), addressLine2: clean(shipping.addressLine2),
    city: clean(shipping.city), state: clean(shipping.state), zip: clean(shipping.zip)
  };
}
function buildLineItems(cart) {
  if (!Array.isArray(cart) || !cart.length) throw new Error('Your cart is empty.');
  const line_items = cart.map(item => {
    const product = byId.get(Number(item.id));
    if (!product) throw new Error(`Unknown product: ${item.id}`);
    const quantity = Math.max(1, Math.min(20, Number(item.quantity) || 1));
    return {
      price_data: { currency: 'usd', product_data: { name: product.name, description: `${product.brand} • ${product.color}${item.size ? ` • Size ${String(item.size).slice(0,20)}` : ''}` }},
      quantity,
      amount: Math.round(product.price * 100) * quantity
    };
  });
  line_items.push({ price_data: {currency:'usd', product_data:{name:'Standard Shipping'}}, quantity:1, amount:500 });
  return line_items;
}
app.get('/api/stripe-config', (req, res) => {
  if (!process.env.STRIPE_PUBLISHABLE_KEY) return res.status(503).json({error:'Stripe publishable key is not configured. Add STRIPE_PUBLISHABLE_KEY to .env.'});
  res.json({publishableKey: process.env.STRIPE_PUBLISHABLE_KEY});
});

app.post('/api/create-payment-intent', async (req, res) => {
  try {
    if (!stripe) return res.status(503).json({error:'Stripe is not configured yet. Add STRIPE_SECRET_KEY to .env.'});
    const items = buildLineItems(req.body.cart);
    const shipping = validateShipping(req.body.shipping);
    const email = typeof req.body.email === 'string' ? req.body.email.trim().slice(0,200) : '';
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Please provide a valid email address.');
    const amount = items.reduce((sum, item) => sum + item.amount, 0);
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: {enabled: true},
      receipt_email: email,
      shipping: {
        name: `${shipping.firstName} ${shipping.lastName}`,
        address: {line1: shipping.addressLine, line2: shipping.addressLine2 || undefined, city: shipping.city, state: shipping.state, postal_code: shipping.zip, country: 'US'}
      },
      metadata: {cart: JSON.stringify((req.body.cart || []).map(x => ({id:Number(x.id), size:String(x.size || ''), quantity:Number(x.quantity) || 1}))).slice(0,490)}
    });
    res.json({clientSecret:intent.client_secret, amount});
  } catch (err) {
    console.error(err);
    res.status(400).json({error: err.message || 'Unable to prepare secure payment.'});
  }
});

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    if (!stripe) return res.status(503).json({error:'Stripe is not configured yet. Add STRIPE_SECRET_KEY to .env.'});
    const cart = Array.isArray(req.body.cart) ? req.body.cart : [];
    if (!cart.length) return res.status(400).json({error:'Your cart is empty.'});

    const line_items = cart.map(item => {
      const product = byId.get(Number(item.id));
      if (!product) throw new Error(`Unknown product: ${item.id}`);
      const quantity = Math.max(1, Math.min(20, Number(item.quantity) || 1));
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: `${product.brand} • ${product.color}${item.size ? ` • Size ${String(item.size).slice(0,20)}` : ''}`
          },
          unit_amount: Math.round(product.price * 100)
        },
        quantity
      };
    });

    // Flat $5 shipping is always added server-side so the browser cannot alter it.
    const SHIPPING_CENTS = 500;
    line_items.push({
      price_data: {
        currency: 'usd',
        product_data: {name: 'Standard Shipping'},
        unit_amount: SHIPPING_CENTS
      },
      quantity: 1
    });
    const origin = process.env.PUBLIC_SITE_URL || `http://localhost:${PORT}`;
    const selectedMethod = String(req.body.paymentMethod || 'card');
    // Apple Pay is surfaced by Stripe Checkout when supported; it uses the card rail.
    const methodMap = {card:['card'], applepay:['card'], cashapp:['cashapp'], paypal:['paypal']};
    const payment_method_types = methodMap[selectedMethod];
    if (!payment_method_types) throw new Error('That payment method requires manual setup.');

    const shipping = req.body.shipping && typeof req.body.shipping === 'object' ? req.body.shipping : null;
    const clean = value => typeof value === 'string' ? value.trim().slice(0, 100) : '';
    if (!shipping || !clean(shipping.firstName) || !clean(shipping.lastName) || !clean(shipping.addressLine) || !clean(shipping.city) || !clean(shipping.state) || !/^[0-9]{5}(?:-[0-9]{4})?$/.test(clean(shipping.zip))) {
      throw new Error('Please provide a complete U.S. shipping address.');
    }
    const email = typeof req.body.email === 'string' ? req.body.email.trim().slice(0,200) : '';
    if (!email) throw new Error('A valid email address is required.');
    const customer = await stripe.customers.create({
      email,
      name: `${clean(shipping.firstName)} ${clean(shipping.lastName)}`,
      shipping: {
        name: `${clean(shipping.firstName)} ${clean(shipping.lastName)}`,
        address: {
          line1: clean(shipping.addressLine),
          line2: clean(shipping.addressLine2),
          city: clean(shipping.city),
          state: clean(shipping.state),
          postal_code: clean(shipping.zip),
          country: 'US'
        }
      }
    });
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types,
      line_items,
      customer: customer.id,
      shipping_address_collection: {allowed_countries: ['US']},
      billing_address_collection: 'required',
      phone_number_collection: {enabled: false},
      success_url: `${origin}/checkout.html?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout.html?payment=cancelled`,
      metadata: {cart: JSON.stringify(cart.map(x => ({id:Number(x.id), size:String(x.size || ''), quantity:Number(x.quantity) || 1}))).slice(0, 490)}
    });

    res.json({url: session.url});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: err.message || 'Unable to start checkout.'});
  }
});

app.get('/api/payment-status', async (req, res) => {
  try {
    if (!stripe) return res.status(503).json({error:'Stripe is not configured.'});
    const session = await stripe.checkout.sessions.retrieve(String(req.query.session_id || ''));
    res.json({payment_status: session.payment_status, status: session.status});
  } catch (err) {
    res.status(400).json({error:'Invalid checkout session.'});
  }
});

app.listen(PORT, () => console.log(`JUMPINKICKZZ running at http://localhost:${PORT}`));
