#!/usr/bin/env node

const BASE_URL = 'http://localhost:4000';

async function testDemoPaymentFlow() {
  console.log('🧪 Testing Demo Payment Flow\n');

  // Step 1: Login as buyer
  console.log('Step 1: Login as buyer...');
  const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'buyer@test.com',
      password: 'Test1234!'
    }),
  });

  if (!loginResponse.ok) {
    console.log('❌ Login failed');
    return;
  }

  const cookies = loginResponse.headers.get('set-cookie')
    .split(',')
    .map(c => c.trim().split(';')[0])
    .join('; ');
  console.log('✅ Logged in\n');

  // Step 2: Get an artwork
  console.log('Step 2: Get artwork...');
  const artworksResponse = await fetch(`${BASE_URL}/artworks`);
  const artworks = await artworksResponse.json();
  
  if (!artworks || artworks.length === 0) {
    console.log('❌ No artworks available');
    return;
  }

  const artwork = artworks[0];
  console.log(`✅ Found artwork: "${artwork.title}"\n`);

  // Step 3: Create checkout with test provider
  console.log('Step 3: Create checkout with test provider...');
  const checkoutResponse = await fetch(`${BASE_URL}/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    },
    body: JSON.stringify({
      artworkId: artwork.id,
      paymentProvider: 'test'
    })
  });

  if (!checkoutResponse.ok) {
    const error = await checkoutResponse.text();
    console.log('❌ Checkout failed:', error);
    return;
  }

  const checkoutResult = await checkoutResponse.json();
  const orderId = checkoutResult.order.id;
  console.log(`✅ Order created: ${orderId}`);
  console.log(`   Payment Provider: ${checkoutResult.order.paymentProvider}`);
  console.log(`   Payment Status: ${checkoutResult.order.paymentStatus}`);
  console.log(`   Order Status: ${checkoutResult.order.orderStatus}\n`);

  // Step 4: Complete test payment
  console.log('Step 4: Complete test payment...');
  const completeResponse = await fetch(`${BASE_URL}/test/complete-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    },
    body: JSON.stringify({ orderId })
  });

  if (!completeResponse.ok) {
    const error = await completeResponse.text();
    console.log('❌ Test payment failed:', error);
    return;
  }

  const completeResult = await completeResponse.json();
  console.log('✅ Test payment completed!');
  console.log(`   Message: ${completeResult.message}`);
  console.log(`   Order ID: ${completeResult.orderId}\n`);

  // Step 5: Check order status
  console.log('Step 5: Check order status...');
  const orderResponse = await fetch(`${BASE_URL}/orders/${orderId}`, {
    headers: { 'Cookie': cookies }
  });

  if (!orderResponse.ok) {
    console.log('⚠️  Could not fetch order details');
    return;
  }

  const order = await orderResponse.json();
  console.log('📦 Order Status:');
  console.log(`   Payment Status: ${order.paymentStatus}`);
  console.log(`   Order Status: ${order.orderStatus}`);
  console.log(`   Amount: ${order.currency} ${order.amountCents / 100}\n`);

  console.log('✅ Demo payment flow completed successfully!');
  console.log('\n💡 The minting job should now be processing in the background.');
  console.log('   Check the backend logs for minting progress.');
}

testDemoPaymentFlow().catch(console.error);
