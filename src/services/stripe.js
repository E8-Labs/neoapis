import StripeSdk from 'stripe'
import axios from 'axios';
import qs from 'qs'
import db from "../models/index.js";

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from'path';
// import logo from '../assets/applogo.png'


export const SubscriptionTypesSandbox = [
    { type: "Monthly", price: 19.99, id: "price_1PBeaHB5evLOKOQy7eCxKp1l", environment: "Sandbox" },
    { type: "HalfYearly", price: 100, id: "price_1PBebWB5evLOKOQyCNx2ISuW", environment: "Sandbox" },
    { type: "Yearly", price: 49.99, id: "price_1PBebjB5evLOKOQynjl9AAOO", environment: "Sandbox" },
]

//update the subscription ids here to live ones
export const SubscriptionTypesProduction = [
    { type: "Monthly", price: 19.99, id: "price_1P9VnxB5evLOKOQyP1MYmcuc", environment: "Production" },
    { type: "HalfYearly", price: 100, id: "price_1P9Vp7B5evLOKOQyPWnc2OA6", environment: "Production" },
    { type: "Yearly", price: 49.99, id: "price_1P9VrLB5evLOKOQykDvowoG5", environment: "Production" },
]

const AppSuffix = "Neo"
export const createCustomer = async (user, whoami = "default") => {


    let key = process.env.Environment === "Sandbox" ? process.env.STRIPE_SK_TEST : process.env.STRIPE_SK_PRODUCTION;
    console.log("Key is create customer ", key)
    console.log('whoami', whoami)


    try {
        const stripe = StripeSdk(key);
        let alreadyCustomer = await findCustomer(user)
        console.log("Customer is ", alreadyCustomer)
        let u = await db.User.findByPk(user.id)
        if (alreadyCustomer.data.length >= 1) {
            console.log("Already found ")
            u.customerId = alreadyCustomer.data[0].id;
            let updated = await u.save()
            console.log("Returning Already customer")
            return alreadyCustomer.data[0]
        }
        else {
            const customer = await stripe.customers.create({
                name: user.name,
                email: user.email + AppSuffix,
                metadata: { id: user.id + AppSuffix, dob: user.dob || '', image: user.profile_image || '', points: user.points }
            });

            console.log("Customer New ", customer)
            u.customerId = customer.id;
            await u.save();
            return customer
        }


        // return customer
    }
    catch (error) {
        console.log(error)
        return null
    }
}

export const findCustomer = async (user) => {

    let key = process.env.Environment === "Sandbox" ? process.env.STRIPE_SK_TEST : process.env.STRIPE_SK_PRODUCTION;
    console.log("Key is find cust", key)
    
    try {
        const stripe = StripeSdk(key);
        // const customer = await stripe.customers.search({
        //     query: `email: '${user.email}'`
        // }); 

        const customer = await stripe.customers.search({
            query: `metadata['id']:'${user.id}${AppSuffix}'`
        });

        return customer
    }
    catch (error) {
        //console.log(error)
        return null
    }
}


export const checkCouponValidity = async (couponId) => {
    try {
        let key = process.env.Environment === "Sandbox" ? process.env.STRIPE_SK_TEST : process.env.STRIPE_SK_PRODUCTION;
        console.log("Key is check coupon", key)
        const stripe = StripeSdk(key);
      // Retrieve the coupon from Stripe
      console.log("Checking coupon with id ", couponId)
      const coupon = await stripe.coupons.retrieve(couponId);
    console.log("Coupon is ", coupon)
      // Check if the coupon is still valid
      if (!coupon.valid) {
        console.log('Coupon is not valid.')
        return false
        return 'Coupon is not valid.';
      }
  
      // Check if the coupon has a redemption limit and if it has been reached
      if (coupon.max_redemptions && coupon.times_redeemed >= coupon.max_redemptions) {
        return false
        console.log( 'Coupon has reached its maximum number of redemptions.')
      }
  
      // Check if the coupon has an expiration date and if it has expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (coupon.redeem_by && currentTime > coupon.redeem_by) {
        return false
        console.log( 'Coupon has expired.')
      }
  
      // If all checks pass
      
      console.log( 'Coupon is valid and available for use.')
      return true
    } catch (error) {
      // Handle errors (e.g., coupon does not exist)
      console.error('Error retrieving coupon:', error.message);
      console.log( `Failed to retrieve coupon: ${error.message}`)
      return false
    }
  };


export const createCard = async (user, token) => {

    let key = process.env.Environment === "Sandbox" ? process.env.STRIPE_SK_TEST : process.env.STRIPE_SK_PRODUCTION;
    //console.log("Key is ", key)
    

    try {
        const stripe = StripeSdk(key);
        let customer = await createCustomer(user, "createcard");

        const customerSource = await stripe.customers.createSource(
            customer.id,
            {
                source: token,
            }
        );
        console.log("Card create ", customerSource)

        return customerSource
    }
    catch (error) {
        console.log("Card error ")
        console.log(error)
        return null
    }
}





export const createPromo = async (code, repetition = "once", duration_in_months = null, percent_off = 50, applies_to = "All") => {
    const key = process.env.Environment === "Sandbox" ? process.env.STRIPE_SK_TEST : process.env.STRIPE_SK_PRODUCTION;
    const stripe = StripeSdk(key);
    //Monthly, HalfYearly, Yearly
    let MonthPID = process.env.Environment === "Sandbox" ? "prod_Q1i0Ts5frQe8fZ" : "prod_PzUntWaL2cGCre"
    let HalfYearPID = process.env.Environment === "Sandbox" ? "prod_Q1i1XCOwozX1Vd" : "prod_PzUoUdee8wPQHA"
    let YearPID = process.env.Environment === "Sandbox" ? "prod_Q1i1ab5JC4J7Ql" : "prod_PzUrqNVq181qHi"
    let products = [MonthPID, HalfYearPID, YearPID,]
    //console.log("Using products for ", process.env.Environment)
    if (applies_to === "Monthly") {
        products = [MonthPID]
    }
    else if (applies_to === "HalfYearly") {
        products = [HalfYearPID]
    }
    else if (applies_to === "Yearly") {
        products = [YearPID]
    }


    try {
        let data = {
            id: code,
            duration: "once",
            percent_off: percent_off,
            applies_to: {
                products: products
            }
        };

        if (duration_in_months !== null) {
            data.duration = "repeating";
            data.duration_in_months = duration_in_months;
        }

        const coupon = await stripe.coupons.create(data);
        return coupon;
    } catch (error) {
        console.error("Error creating promo:", error);
        throw error;
    }
};

export const GetCoupon = async (code) => {
    const key = process.env.Environment === "Sandbox" ? process.env.STRIPE_SK_TEST : process.env.STRIPE_SK_PRODUCTION;
    const stripe = StripeSdk(key);
    try {
        const coupon = await stripe.coupons.retrieve(code);
        return coupon;
    } catch (error) {
        console.error("Error retrieving coupon:", error);
        throw error;
    }
};



export const createSubscription = async (user, subscription, code = null) => {
    const key = process.env.Environment === "Sandbox" ? process.env.STRIPE_SK_TEST : process.env.STRIPE_SK_PRODUCTION;
    const stripe = StripeSdk(key);
    try {
        let customer = await createCustomer(user, "createsub");
        console.log("Customer in subs is ", customer)
        let data = {
            customer: customer.id,
            items: [
                {
                    price: subscription.id,
                },
            ],
            trial_period_days: 7,
        };

        if (code !== null) {
            //console.log("Code is not null");
            try {
                let coupon = await GetCoupon(code);
                if (coupon) {
                    //console.log("Coupon exists:", coupon);
                    data.discounts = [{ coupon: code }];
                } else {
                    return { status: false, message: "No such coupon" };
                }
            } catch (error) {
                console.error("Error applying coupon:", error);
                return { status: false, message: "No such coupon" };
            }
        }

        //console.log("Data applying for subscription is", data);
        const sub = await stripe.subscriptions.create(data);
        //console.log("Subscribed successfully:", sub);
        return { data: sub, status: true, message: "User subscribed" };
    } catch (error) {
        console.error("Error creating subscription:", error);
        return { data: error, status: false, message: error.message };
    }
};


export const cancelSubscription = async (user, subscription) => {

    let key = process.env.Environment === "Sandbox" ? process.env.STRIPE_SK_TEST : process.env.STRIPE_SK_PRODUCTION;
    //console.log("Subscription in stripe.js ", subscription)

    try {
        const stripe = StripeSdk(key);
        let customer = await createCustomer(user, "cancelsub");
        let subid = subscription.subid;

        // const sub = await stripe.subscriptions.cancel(
        //     subid
        // );
        const sub = await stripe.subscriptions.update(subid, {
            cancel_at_period_end: true
        });
        // let subs = await GetActiveSubscriptions(user)


        return { data: sub, status: true, message: "Subscription will cancel at period end" };
    }
    catch (error) {
        //console.log(error)
        return { data: error, status: false, message: error };
    }
}


// export const resumeSubscription = async (user, subscription) => {

//     let key = process.env.Environment === "Sandbox" ? process.env.STRIPE_SK_TEST : process.env.STRIPE_SK_PRODUCTION;
//     //console.log("Subscription in stripe.js ", subscription)

//     try {
//         const stripe = StripeSdk(key);
//         let customer = await createCustomer(user);
//         let subid = subscription.subid;

//         const sub = await stripe.subscriptions.resume(
//             subid
//           );
//         // let subs = await GetActiveSubscriptions(user)


//         return { data: sub, status: true, message: "Subscription cancelled" };
//     }
//     catch (error) {
//         //console.log(error)
//         return { data: error, status: false, message: error };
//     }
// }



export const CreateWebHook = async (req, res) => {
    let key = process.env.Environment === "Sandbox" ? process.env.STRIPE_SK_TEST : process.env.STRIPE_SK_PRODUCTION;
    const stripe = StripeSdk(key);

    const webhookEndpoint = await stripe.webhookEndpoints.create({
        enabled_events: ['customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted', 'customer.subscription.paused', 'customer.subscription.resumed',
    'customer.subscription.pending_update_applied', 'customer.subscription.pending_update_expired'],
        url: req.body.url,
    });
    res.send({status: true, message: "Webhook", webhookEndpoint})
}


export const SubscriptionUpdated = async (req, res)=>{
    let data = req.body;
    //console.log("Subscription updated", data)
    let type = data.type;
    console.log("EVent is ", type);


    switch (type) {
        case 'customer.subscription.created':
            console.log("Subscription created")
            // await handleSubscriptionCreated(event.data.object);
            break;
        case 'customer.subscription.updated':
            await handleSubscriptionUpdated(data.data.object);
            break;
        case 'customer.subscription.deleted':
            await handleSubscriptionDeleted(data.data.object);
            break;
        case 'customer.subscription.paused':
            await handleSubscriptionPaused(data.data.object);
            break;
        case 'customer.subscription.resumed':
            await handleSubscriptionResumed(data.data.object);
            break;
        case 'customer.subscription.pending_update_applied':
            await handleSubscriptionPendingUpdateApplied(data.data.object);
            break;
        case 'customer.subscription.pending_update_expired':
            await handleSubscriptionPendingUpdateExpired(data.data.object);
            break;
        case 'invoice.payment_succeeded':
        case 'invoice.payment_failed':
            const invoice = data.data.object;
            
            let subId = invoice.subscription;
            let sub = db.SubscriptionModel.findOne({
                where: {
                    subid: subId
                }
            })
            let status = type === 'invoice.payment_succeeded' ? 'succeeded' : 'failed'

            // console.log()
            await db.TransactionModel.create({
                customerId: invoice.customer,
                subscriptionId: subId,//invoice.subscription,
                amount: invoice.amount_paid / 100,
                currency: invoice.currency,
                status: status,
                invoiceId: invoice.id
            });
        default:
            console.log(`Unhandled event type ${type}`);
    }


    res.send({status: true, message: "Subscription updated", event: type})
}
export const RetrieveASubscriptions = async (subid) => {
    //console.log("Retrieving ", subid)
    let key = process.env.Environment === "Sandbox" ? process.env.STRIPE_SK_TEST : process.env.STRIPE_SK_PRODUCTION;
    // //console.log("Subscription in stripe.js ", subscription)

    try {
        const stripe = StripeSdk(key);
        const sub = await stripe.subscriptions.retrieve(
            subid
        );
        return sub
    }
    catch (error) {
        //console.log(error)
        return null
    }
}


export const GetActiveSubscriptions = async (user) => {

    let key = process.env.Environment === "Sandbox" ? process.env.STRIPE_SK_TEST : process.env.STRIPE_SK_PRODUCTION;
    // //console.log("Subscription in stripe.js ", subscription)

    try {
        const stripe = StripeSdk(key);
        let active = await db.SubscriptionModel.findAll({
            where: {
                UserId: user.id,
                [db.Sequelize.Op.or]: [
                    {status: "active"},
                    {status: "trialing"}
                ]
            }
        })
        if(active && active.length > 0){
            return active
        }
        // let customer = await createCustomer(user, "getactivesub");
        // const sub = await stripe.subscriptions.list({
        //     customer: customer.id,
        //     status: 'active'
        // });
        //console.log("##############")
        //console.log("Subscriptions for user  ", user.email)
        //console.log("Customer id", customer.id)
        //console.log("##############")
        // return sub
    }
    catch (error) {
        console.log(error)
        return null
    }
}



// export const deleteCard = async (user, token) => {

//     let key = process.env.Environment === "Sandbox" ? process.env.STRIPE_SK_TEST : process.env.STRIPE_SK_PRODUCTION;
//     //console.log("Key is ", key)
//     const stripe = StripeSdk(key);

//     try {
//         let customer = await createCustomer(user);

//         const customerSource = await stripe.customers.deleteSource(
//             customer.id,
//             {
//                 source: token,
//             }
//         );

//         return customerSource
//     }
//     catch (error) {
//         //console.log(error)
//         return null
//     }
// }

export const loadCards = async (user) => {
    let key = process.env.Environment === "Sandbox" ? process.env.STRIPE_SK_TEST : process.env.STRIPE_SK_PRODUCTION;
    //console.log("Key is ", key)
    const stripe = StripeSdk(key);

    try {
        let customers = await findCustomer(user)
        let customer = null
        if(customers && customers.data.length > 0){
            customer = customers.data[0]
        }
        console.log("Customer in load card is ", customer)

        let data = qs.stringify({
            'limit': '10'
        });

        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://api.stripe.com/v1/customers/${customer.id}/cards?limit=3`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Bearer ${key}`
            },
            data: data
        };

        let response = await axios.request(config);
        if (response) {
            //console.log("Load cards request");
            //console.log(JSON.stringify(response.data.data));
            return response.data.data;
        }
        else {
            //console.log("Load cards request errored");
            //console.log(error);
            return null
        };
    }
    catch (error) {
        //console.log("Load cards request errored out");
        //console.log(error)
        return null
    }


}


//function that parses the subscription object and retrieves only desired info to show to the user
// status of the subscription // active, cancelled, trialing, paused etc
// isTrial: true or false
// trialRemainingDays: 0 or more
// daysTillExpiry: 0 or more
// subscriptionType: yearly, monthly, weekly
// willRenewAtPeriodEnd: true or false
// price: in US dollar
// startDate: mm-dd-yyyy
// discountApplied: true or false
// discountedPrice: price charged after discount
// DiscountCodeUsed: Code If available
export function parseSubscription(subscription) {
    const status = subscription.status;
    const isTrial = subscription.status === 'trialing';
    const trialRemainingDays = subscription.trial_end ? Math.max(0, Math.ceil((subscription.trial_end - Date.now() / 1000) / 86400)) : 0;
    const daysTillExpiry = subscription.current_period_end ? Math.max(0, Math.ceil((subscription.current_period_end - Date.now() / 1000) / 86400)) : 0;

    let subscriptionType = '';
    if (subscription.items && subscription.items.data.length > 0) {
        const interval = subscription.items.data[0].plan.interval;
        switch (interval) {
            case 'month':
                subscriptionType = 'monthly';
                break;
            case 'year':
                subscriptionType = 'yearly';
                break;
            case 'week':
                subscriptionType = 'weekly';
                break;
            default:
                subscriptionType = 'unknown';
        }
    }

    const willRenewAtPeriodEnd = !subscription.cancel_at_period_end;
    const price = subscription.items && subscription.items.data.length > 0 ? (subscription.items.data[0].plan.amount / 100).toFixed(2) : '0.00';

    const startDate = new Date(subscription.start_date * 1000).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    });

    const discountApplied = subscription.discount !== null;
    const discountedPrice = discountApplied ? (subscription.items.data[0].plan.amount - (subscription.discount.coupon.amount_off || 0) / 100).toFixed(2) : price;
    const discountCodeUsed = discountApplied ? subscription.discount.coupon.id : null;

    return {
        status,
        isTrial,
        trialRemainingDays,
        daysTillExpiry,
        subscriptionType,
        willRenewAtPeriodEnd,
        price,
        startDate,
        discountApplied,
        discountedPrice,
        discountCodeUsed
    };
}



const handleSubscriptionCreated = async (subscription) => {
    await db.SubscriptionModel.create({
        subid: subscription.id,
        userId: subscription.customer,
        customerId: "",//subscription.customer,
        status: subscription.status,
        data: JSON.stringify(subscription)
    });
    console.log(`Subscription created: ${subscription.id}`);
};

const handleSubscriptionUpdated = async (subscription) => {
    await db.SubscriptionModel.update(
        { status: subscription.status, data: JSON.stringify(subscription) },
        { where: { subid: subscription.id } }
    );
    console.log(`Subscription updated: ${subscription.id}`);
};

const handleSubscriptionDeleted = async (subscription) => {
    await db.SubscriptionModel.update(
        { status: 'deleted', data: JSON.stringify(subscription) },
        { where: { subid: subscription.id } }
    );
    console.log(`Subscription deleted: ${subscription.id}`);
};

const handleSubscriptionPaused = async (subscription) => {
    await db.SubscriptionModel.update(
        { status: 'paused', data: JSON.stringify(subscription) },
        { where: { subid: subscription.id } }
    );
    console.log(`Subscription paused: ${subscription.id}`);
};

const handleSubscriptionResumed = async (subscription) => {
    await db.SubscriptionModel.update(
        { status: 'resumed', data: JSON.stringify(subscription) },
        { where: { subid: subscription.id } }
    );
    console.log(`Subscription resumed: ${subscription.id}`);
};

const handleSubscriptionPendingUpdateApplied = async (subscription) => {
    await db.SubscriptionModel.update(
        { status: 'pending_update_applied', data: JSON.stringify(subscription) },
        { where: { subid: subscription.id } }
    );
    console.log(`Pending update applied to subscription: ${subscription.id}`);
};

const handleSubscriptionPendingUpdateExpired = async (subscription) => {
    await db.SubscriptionModel.update(
        { status: 'pending_update_expired', data: JSON.stringify(subscription) },
        { where: { subid: subscription.id } }
    );
    console.log(`Pending update expired for subscription: ${subscription.id}`);
};




export const createInvoicePdf = async (invoiceId) => {

    let key = process.env.Environment === "Sandbox" ? process.env.STRIPE_SK_TEST : process.env.STRIPE_SK_PRODUCTION;
    //console.log("Key is ", key)
    const stripe = StripeSdk(key);
    // Retrieve the invoice from Stripe
    const invoice = await stripe.invoices.retrieve(invoiceId);

    // Define the directory to store the PDF
    let dir = process.env.DocsDir//'../uploads/documents'//'/var/www/neo/neoapis/uploads/documents'
    const docDir = path.join(dir + "/documents");
    
    // Ensure the directory exists
    if (!fs.existsSync(docDir)) {
        fs.mkdirSync(docDir, { recursive: true });
    }

    // Define the file name and path
    const mediaFilename = `${invoiceId}.pdf`;
    const docPath = path.join(docDir, mediaFilename);

    // Create a new PDF document
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(docPath));

    // Add content to the PDF
    // Header
    doc
        .image('src/assets/applogo.png', 50, 45, { width: 50 }) // Add your logo path
        .fontSize(20)
        .text('Neo AI', 110, 57)
        .fontSize(10)
        .text('123 Your Street', 200, 65, { align: 'right' })
        .text('City, State, ZIP Code', 200, 80, { align: 'right' })
        .text('Phone: (555) 555-5555', 200, 95, { align: 'right' })
        .moveDown();

    // Invoice title
    doc
        .fontSize(20)
        .text('INVOICE', 50, 160);

    // Invoice details
    doc
        .fontSize(10)
        .text(`Invoice ID: ${invoice.id}`, 50, 200)
        .text(`Invoice Date: ${new Date(invoice.created * 1000).toLocaleDateString()}`, 50, 215)
        .text(`Due Date: ${new Date(invoice.due_date * 1000).toLocaleDateString()}`, 50, 230)
        .moveDown();

    // Customer details
    doc
        .text(`Bill To:`, 50, 270)
        .text(`Customer ID: ${invoice.customer}`, 50, 285)
        .moveDown();

    // Table for items
    const tableTop = 330;
    const itemCodeX = 50;
    const descriptionX = 260;
    const amountX = 450;

    doc
        .fontSize(10)
        .text('Item Code', itemCodeX, tableTop)
        .text('Description', descriptionX, tableTop)
        .text('Amount', amountX, tableTop);

    const generateTableRow = (y, item) => {
        doc
            .fontSize(10)
            .text(item.id, itemCodeX, y)
            .text(item.description, descriptionX, y)
            .text(`$${(item.amount / 100).toFixed(2)}`, amountX, y);
    };

    let y = tableTop + 25;
    invoice.lines.data.forEach((item, index) => {
        generateTableRow(y, item);
        y += 25;
    });

    // Summary
    doc
        .fontSize(10)
        .text(`Subtotal: $${(invoice.subtotal / 100).toFixed(2)}`, amountX, y + 25)
        .text(`Tax: $${(invoice.tax / 100).toFixed(2)}`, amountX, y + 40)
        .text(`Total: $${(invoice.total / 100).toFixed(2)}`, amountX, y + 55)
        .moveDown();

    // Footer
    doc
        .text('Thank you for your business!', 50, y + 100, { align: 'center', width: 500 });

    // Finalize the PDF
    doc.end();

    // Generate the URL to the PDF
    const docUrl = `https://www.blindcircle.com:444/neo/uploads/documents/${mediaFilename}`;
    
    return docUrl;
};
