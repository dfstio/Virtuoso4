const { URL,  STRIPE_KEY, STRIPE_ENDPOINT_SECRET, CHAIN_ID, CONTRACT_ADDRESS } = process.env;

const stripe = require('stripe')(STRIPE_KEY);
const delayMS = 1000;


const { addBalance, getTokenPrice } = require("./contract");
const { lambdaTransferToken, lambdaAddBalance, lambdaMintItem } = require("../serverless/lambda");
const DEBUG = ("true"===process.env.DEBUG);



async function checkoutCompleted(body, headers)
{
        //if(DEBUG) console.log("checkoutCompleted ", body, headers, STRIPE_ENDPOINT_SECRET, STRIPE_KEY);
        const sig = headers['stripe-signature'];
        let endpointSecret = STRIPE_ENDPOINT_SECRET;
        if( (process.env.CONTEXT !== undefined) && (process.env.CONTEXT === 'dev') ) endpointSecret  = "whsec_z15BzPOir0nXvUcGGsavF2FuTr1diPQT";
        let event;
        // if(DEBUG) console.log("checkoutCompleted start", endpointSecret, process.env.CONTEXT );

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
             //console.log(`Webhook: checkout.session.completed`);
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


    	 const paymentIntent = await stripe.paymentIntents.retrieve( checkout.payment_intent );

       if(DEBUG) console.log("handleCheckoutCompleted: ", checkout.metadata.type, checkout.payment_status, paymentIntent.status);
       if( checkout.payment_status == 'paid')
       {

         switch (checkout.metadata.type) {
            case 'mint':
            console.log("Mint: adding balance");
            await lambdaAddBalance(checkout.metadata.address, 1000, "10 NFT mint pack bought");
            break;
            case 'buy':
            console.log(`Buy`, checkout.metadata);
            const id = parseInt(checkout.metadata.tokenId);
            await lambdaTransferToken(id, checkout.metadata,  checkout.customer_details.email );
            break;
            default:
            // Unexpected event type
            console.log(`handleCheckoutCompleted: Unhandled event type ${checkout.metadata.type}.`);
              }
       }
       else if( checkout.payment_status == 'unpaid' && checkout.metadata.type == 'buy' && paymentIntent.status == 'requires_capture')
       {
         console.log("Checkout require capture - buy");
         const id = parseInt(checkout.metadata.tokenId);
         const status = await lambdaTransferToken(id, checkout.metadata,  checkout.customer_details.email );
         if( status)
         {
           const intent = await stripe.paymentIntents.capture(paymentIntent.id);
           console.log("Payment captured: ", intent.status);
         } else console.error("Payment NOT captured - token transfer failed");

       }
       else if( checkout.payment_status == 'unpaid' && checkout.metadata.type == 'mintItem' && paymentIntent.status == 'requires_capture')
       {
         //console.log("Checkout require capture - mintItem", checkout, "payment_intent", paymentIntent);
         const status = await lambdaMintItem(checkout.id, checkout.metadata,  checkout.customer_details.email );
         if( status)
         {
           const intent = await stripe.paymentIntents.capture(paymentIntent.id);
           console.log("Payment captured: ", intent.status);
         } else console.error("Payment NOT captured - token minting failed");

       };

       //console.log("Checkout status: ", checkout.payment_status);


}

async function createCheckoutSession(body)
{
  if(DEBUG) console.log("createCheckoutSession body", body);

  let success_url = URL + "/token/" + CHAIN_ID + "/" + CONTRACT_ADDRESS + "/" + body.tokenId.toString() + "/checkout/success";
	let cancel_url  = URL + "/token/" + CHAIN_ID + "/" + CONTRACT_ADDRESS + "/" + body.tokenId.toString() + "/checkout/cancel";

  if( body.type == "buy")
  {

		const token =  await getTokenPrice(body.tokenId);
		//if(DEBUG) console.log("createCheckoutSession token:", token);


		if( token.onSale && (token.saleID === body.saleID))
		{
			  const currency = token.sale.currency;
			  const amount = token.sale.price * 100;
			  const image = `https://res.cloudinary.com/virtuoso/image/fetch/h_300,q_100,f_auto/${
            token.uri.image
            }`;


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
			   client_reference_id: body.address,
			   payment_intent_data: { capture_method: 'manual'},
			   metadata: {
			        type: "buy",
			        address: body.address,
			        tokenId: body.tokenId,
			        saleID: body.saleID,
			        credit: creditAmount,
			        currency: currency,
			        name: token.uri.name,
			        price: token.sale.price,
			        image: image
			        },
			 });
			 return  session.url;
		}
		else console.error("Token No ", body.tokenId, " is not on sale" );
	}
	/*
	else if(body.type == "mint" )
	{
		console.log("Mint order received from ", body.address);
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
		 client_reference_id: body.address,
		 metadata: { type: "mint", address: body.address },
	   });

	   return  session.url;
	}
	*/
	else if(body.type == "mintItem" )
	{
	    	 console.log("MintItem order received", body);
	       const session = await stripe.checkout.sessions.create({
                payment_method_types: [
                'card',
                ],
                line_items: [
                {
                price_data: {
                  currency: body.currency,
                  product_data: {
                  name: "Creation of the Virtuoso NFT token",
                  description: body.name,
                  images: [URL+"/mintimages/public.jpg"]
                  },
                  unit_amount: body.price * 100,
                },
                  quantity: 1,
                },
                ],
                mode: 'payment',
                success_url: URL + "/marketplace",
                cancel_url: URL + "/marketplace",
                client_reference_id: body.address,
                payment_intent_data: { capture_method: 'manual'},
                metadata: body
              });
			 return  session.url;
	  };

}



module.exports = {
    checkoutCompleted,
    createCheckoutSession

}
