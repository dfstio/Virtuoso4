const STRIPE_KEY = process.env.STRIPE_TEST;
const STRIPE_ENDPOINT_SECRET =  process.env.STRIPE_ENDPOINT_SECRET;
const stripe = require('stripe')(STRIPE_KEY);
const URL = process.env.URL;
const delayMS = 1000;


const { addBalance, transferToken, getTokenPrice } = require("./contract");
const DEBUG = true;



async function checkoutCompleted(body, headers)
{
        //if(DEBUG) console.log("checkoutCompleted ", body, headers, STRIPE_ENDPOINT_SECRET, STRIPE_KEY);
        const sig = headers['stripe-signature'];
        let endpointSecret = STRIPE_ENDPOINT_SECRET;
        if( (process.env.CONTEXT != undefined) && (process.env.CONTEXT == 'dev') ) endpointSecret  = "whsec_vEiZFsGgAlXHXaUOFgla0MoFS8hVrtdt";
        let event;
        //if(DEBUG) console.log("checkoutCompleted start");

         try {
           event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
         }
         catch (err) {
           console.error(`Webhook Error: ${err}`);
         }

        if(DEBUG) console.log("checkoutCompleted event", event.type);
         // Handle the event
         switch (event.type) {
           case 'checkout.session.async_payment_succeeded':
             const checkout = event.data.object;
             console.log(`Webhook: checkout.session.async_payment_succeeded`);
             // Then define and call a method to handle the successful payment intent.
             // handlePaymentIntentSucceeded(paymentIntent);
             break;
           case 'checkout.session.completed':
             const checkout1 = event.data.object;
             console.log(`Webhook: checkout.session.completed`);
             await handleCheckoutCompleted(checkout1);
             // Then define and call a method to handle the successful payment intent.
             // handlePaymentIntentSucceeded(paymentIntent);
             break;
           case 'charge.succeeded':
             const charge = event.data.object;
             //console.log(`Webhook: charge.succeeded`, charge);
             //const customer = await stripe.customers.retrieve(charge.customer);
             //console.log(`Webhook: customer `, customer);
             //const paymentIntent = await stripe.paymentIntents.retrieve(charge.payment_intent);
             //console.log(`Webhook: payment intent `, paymentIntent);
             // Then define and call a method to handle the successful payment intent.
             // handlePaymentIntentSucceeded(paymentIntent);
             break;


           case 'checkout.session.async_payment_failed':
             console.log(`Webhook: checkout.session.async_payment_failed`);
             // Then define and call a method to handle the successful attachment of a PaymentMethod.
             // handlePaymentMethodAttached(paymentMethod);
             break;
           default:
             // Unexpected event type
             console.log(`Webhook: Unhandled event type ${event.type}.`);
         }

         // Return a 200 response to acknowledge receipt of the event
         //response.send();
         //response.json({received: true});


}

async function handleCheckoutCompleted(checkout )
{


    	 const paymentIntent = await stripe.paymentIntents.retrieve( checkout. payment_intent );

       if(DEBUG) console.log("handleCheckoutCompleted: ", checkout.metadata.type, checkout.payment_status, paymentIntent.status);
       if( checkout.payment_status == 'paid')
       {

         switch (checkout.metadata.type) {
            case 'mint':
            console.log("Mint: adding balance");
            await addBalance(checkout.metadata.address, 1000, "10 NFT mint pack bought");
            break;
            case 'buy':
            console.log(`Buy`, checkout.metadata);
            const id = parseInt(checkout.metadata.tokenID);
            await transferToken(id, checkout.metadata.address, checkout.metadata.credit);
            break;
            default:
            // Unexpected event type
            console.log(`handleCheckoutCompleted: Unhandled event type ${checkout.metadata.type}.`);
              }
       }
       else if( checkout.payment_status == 'unpaid' && checkout.metadata.type == 'buy' && paymentIntent.status == 'requires_capture')
       {
         console.log("Checkout require capture");
         const id = parseInt(checkout.metadata.tokenID);
         const status = await transferToken(id, checkout.metadata.address, checkout.metadata.credit);
         if( status)
         {
           const intent = await stripe.paymentIntents.capture(paymentIntent.id);
           console.log("Payment captured: ", intent.status);
         } else console.error("Payment NOT captured - token transfer failed");

       };
       console.log("Checkout status: ", checkout.payment_status);


}

async function createCheckoutSession(queryObject)
{
  if(DEBUG) console.log("createCheckoutSession type: ", queryObject.type, " tokenID: ", queryObject.tokenID, " address: ", queryObject.address);

  const success_url = URL + "/checkout/success";
	const cancel_url = URL + "/checkout/cancel";

  if( queryObject.type == "buy")
  {

		const token =  await getTokenPrice(queryObject.tokenID);
		if(DEBUG) console.log("createCheckoutSession token:", token);


		if( token.onSale )
		{
			  const currency = token.sale.currency;
			  const amount = token.sale.price * 100;
			  const image = token.uri.image;


			  // CHANGE THIS CALCULATION !!!
			  const creditAmount = (currency=='rub')?((amount / 75) * 70 /100):(amount * 70 / 100);


			 const session = await stripe.checkout.sessions.create({
			   payment_method_types: [
				 'card',
			   ],
			   line_items: [
			   {
				 price_data: {
				   currency: currency,
				   product_data: {
					 name: token.uri.name,
					 description: token.uri.description,
					 images: [image]
				   },
				   unit_amount: amount,
				 },
				   quantity: 1,
				 },
			   ],
			   mode: 'payment',
			   success_url: success_url,
			   cancel_url: cancel_url,
			   client_reference_id: queryObject.address,
			   payment_intent_data: { capture_method: 'manual'},
			   metadata: { type: "buy", address: queryObject.address, tokenID: queryObject.tokenID, credit: creditAmount  },
			 });
			 return  session.url;
		}
		else console.error("Token No ", queryObject.tokenID, " is not on sale" );
	}
	else if(queryObject.type == "mint" )
	{
		console.log("Mint order received from ", queryObject.address);
	   const session = await stripe.checkout.sessions.create({
		 payment_method_types: [
		   'card',
		 ],
		 line_items:
		 [
		 	{
			 	price: process.env.MINT_PRICE,
			 	quantity: 1,
		   	},
		 ],
		 mode: 'payment',
		 success_url: success_url,
		 cancel_url: cancel_url,
		 client_reference_id: queryObject.address,
		 metadata: { type: "mint", address: queryObject.address },
	   });

	   return  session.url;
	};



}



module.exports = {
    checkoutCompleted,
    createCheckoutSession

}
