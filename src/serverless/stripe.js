const { URL,  STRIPE_KEY, STRIPE_ENDPOINT_SECRET, CHAIN_ID, CONTRACT_ADDRESS } = process.env;

const stripe = require('stripe')(STRIPE_KEY);
const delayMS = 1000;

const logger  = require("./winston");
const logm = logger.debug.child({ winstonModule: 'stripe' });


const { addBalance, getTokenPrice } = require("./contract");
const { lambdaTransferToken, lambdaAddBalance, lambdaMintItem } = require("../serverless/lambda");


async function checkoutCompleted(body, headers)
{

        const log = logm.child({body: JSON.parse(body), headers, wf: "checkoutCompleted"});
        const sig = headers['stripe-signature'];
        let endpointSecret = STRIPE_ENDPOINT_SECRET;
        if( (process.env.CONTEXT !== undefined) && (process.env.CONTEXT === 'dev') ) endpointSecret  = "whsec_z15BzPOir0nXvUcGGsavF2FuTr1diPQT";
        let event;

         try {
           event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
         }
         catch (err) {
           log.error(`Webhook Error: ${err}`, {err});
           return;
         }

        //log.info(`checkoutCompleted event: ${event.type}`);
         // Handle the event
         switch (event.type) {
           case 'checkout.session.completed':
             const checkout1 = event.data.object;
             await handleCheckoutCompleted(checkout1);
             break;

         switch (event.type) {
           case 'charge.succeeded':
             const checkout2 = event.data.object;
             if( event.data.object.metadata && event.data.object.metadata.tguser !== undefined)
                await handleCheckoutCompletedTelegram(checkout2);
             else log.info(`${event.type}`, {event, stripeEvent:true});
             break;


           default:
             // Unexpected event type
             log.info(`${event.type}`, {event, stripeEvent:true});
         }
}

async function handleCheckoutCompletedTelegram(checkout )
{
       const log = logm.child({checkout, wf: "handleCheckoutCompletedTelegram"});


    	 const paymentIntent = await stripe.paymentIntents.retrieve( checkout.payment_intent );
    	 let metadata = JSON.parse(checkout.metadata.payload);
    	 metadata.tguser = checkout.metadata.tguser;
    	 log.info(`processing: ${metadata.type}`, {paymentIntent, metadata});


       if( checkout.status == 'succeeded')
       {

         switch (metadata.type) {
            case 'mint':
            log.error(`FEATURE REMOVED: Mint: adding balance to ${metadata.address}`);
            //await lambdaAddBalance(checkout.metadata.address, 1000, "10 NFT mint pack bought");
            break;
            case 'buy':
            if( metadata.telegram &&  metadata.telegram.from )
            {
                log.info(`Buy token ${metadata.tokenId} for ${metadata.telegram.from.first_name} ${metadata.telegram.from.last_name}`);
                const id = parseInt(metadata.tokenId);
                await lambdaTransferToken(id, metadata,  "" );
            }
            else
            {
              log.error(`Buy token ${metadata.tokenId} - no user data`);
            }

            break;
            default:
            // Unexpected event type
            log.error(`Unhandled event type ${metadata.type}`);
              }
       } else log.error(`Wrong status ${checkout.status}`);

}



async function handleCheckoutCompleted(checkout )
{
       const log = logm.child({checkout, wf: "handleCheckoutCompleted"});
       log.debug(`processing: ${checkout.metadata.type}`);

    	 const paymentIntent = await stripe.paymentIntents.retrieve( checkout.payment_intent );


       if( checkout.payment_status == 'paid')
       {

         switch (checkout.metadata.type) {
            case 'mint':
            log.error(`FEATURE REMOVED: Mint: adding balance to ${checkout.metadata.address}`);
            //await lambdaAddBalance(checkout.metadata.address, 1000, "10 NFT mint pack bought");
            break;
            case 'buy':
            log.info(`Buy token ${checkout.metadata.tokenId} for ${checkout.customer_details.email}`);
            const id = parseInt(checkout.metadata.tokenId);
            await lambdaTransferToken(id, checkout.metadata,  checkout.customer_details.email );
            break;
            default:
            // Unexpected event type
            log.error(`handleCheckoutCompleted: Unhandled event type ${checkout.metadata.type}`);
              }
       }
       else if( checkout.payment_status == 'unpaid' && checkout.metadata.type == 'buy' && paymentIntent.status == 'requires_capture')
       {
         log.info(`Checkout require capture - buying token ${checkout.metadata.tokenId}`);
         const id = parseInt(checkout.metadata.tokenId);
         const status = await lambdaTransferToken(id, checkout.metadata,  checkout.customer_details.email );
         if( status)
         {
           const intent = await stripe.paymentIntents.capture(paymentIntent.id);
           //console.log("Payment captured: ", intent.status);
         } else log.error("Payment NOT captured - token transfer failed");

       }
       else if( checkout.payment_status == 'unpaid' && checkout.metadata.type == 'mintItem' && paymentIntent.status == 'requires_capture')
       {
         //console.log("Checkout require capture - mintItem", checkout, "payment_intent", paymentIntent);
         const status = await lambdaMintItem(checkout.id, checkout.metadata,  checkout.customer_details.email );
         if( status)
         {
           const intent = await stripe.paymentIntents.capture(paymentIntent.id);
           //console.log("Payment captured: ", intent.status);
         } else log.error("Payment NOT captured - token minting failed");

       };

       //console.log("Checkout status: ", checkout.payment_status);


}

async function createCheckoutSession(body)
{
  //if(DEBUG) console.log("createCheckoutSession body", body);
  const log = logm.child({body, wf: "createCheckoutSession"});

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
		else log.error(`Token No ${body.tokenId} is not on sale`);
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
	    	 log.info(`MintItem order received for ${body.name}`);
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
                  images: ["https://content.nftvirtuoso.io/image/mintimages/public.jpg"]
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
