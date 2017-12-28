const form = document.getElementById('payment-form');

/** @type {Object[]} Supported payment methods on the Web Payment Request API */
const supportedPaymentMethods = [{
    supportedMethods: 'basic-card',
}, {
    supportedMethods: ['https://apple.com/apple-pay'],
    data: {
        supportedNetworks: [
            'amex', 
            'discover', 
            'masterCard', 
            'visa',
        ],
        countryCode: 'NL',
        validationEndpoint: '/todo/applepay/validate/',
        merchantIdentifier: 'merchant.com.todo.payment'
    }
}];

/** @type {Object[]} All available shipping options */
const shippingOptions = [
    {
        id: 'economy',
        label: 'Economy (5-7 Days)',
        amount: {
            currency: 'EUR',
            value: '0',
        },
    }, {
        id: 'express',
        label: 'Express (2-3 Days)',
        amount: {
            currency: 'EUR',
            value: '5',
        },
    },
];

/**
 * Get the shipping option by ID. The Web Request API will only return the ID (e.g. 'express')
 * but we want things like the price of shipping from the shipping option object
 * @param {String} id ID of the shipping option (e.g. 'express')
 * @return {Object} Shipping option information
 */
function getShippingOptionById(id) {
    let shippingOption = false;

    shippingOptions.forEach((option) => {
        if (option.id === id) {
            shippingOption = option;
        }
    });

    return shippingOption;
}

/**
 * Get payment details object, this function is mocked but should be connected
 * to a back-end in production
 * @param {Boolean} showShippingOptions Show the shipping options
 * @param {Number} extraShippingCosts Add extra shipping costs
 * @return {Object} Payment details object
 */
function getPaymentDetails(showShippingOptions = false, extraShippingCosts = 0) {
    return {
        total: {
            label: 'Total',
            amount:{
                currency: 'EUR',
                value: 0 + extraShippingCosts,
            },
        },
        shippingOptions: showShippingOptions ? shippingOptions : [],
    };
}

/** @type {Object} WebRequest API options */
const options = {
    requestShipping: true,
    requestPayerName: true,
    requestPayerPhone: true,
    requestPayerEmail: true,
};

/**
 * This validates the payment on the back-end, this function is mocked but should
 * be connected to a back-end in production
 * @return {Promise}
 */
function validatePaymentWithBackend() {
    return new Promise((resolve) => {
        resolve(true);
    });
}

/**
 * Initialize the payment. Create event listeners and show the UI
 * @return {Void}
 */
function makePayment() {
    const paymentRequest = new PaymentRequest(
        supportedPaymentMethods,
        getPaymentDetails(),
        options
    );

    // Handle the change of the shipping address
    paymentRequest.addEventListener('shippingaddresschange', (e) => {
        // Set new options on the Web Payment Request UI (including shipping options)
        event.updateWith(getPaymentDetails(true));
    });

    paymentRequest.addEventListener('shippingoptionchange', (event) => {
        const shippingOption = getShippingOptionById(paymentRequest.shippingOption);
    
        // Set new options on the Web Payment Request UI (including shipping options and shipping costs)
        event.updateWith(getPaymentDetails(true, shippingOption.amount.value));
    });

    paymentRequest
        // Show the UI
        .show()
        // Handle payment completion
        .then((paymentResponse) => {
            if (response.methodName === 'https://apple.com/apple-pay') {
                // Apple Pay JS case
                // Do whatever you need to do with the token:
                // `response.applePayRaw`
            } else {
                // Everything else will be pure Payment Request API response
                // Validate payment on the server
                return validatePaymentWithBackend(paymentResponse)
                    // Handle server validation
                    .then((success) => {
                        if (success) {
                            // Mark the payment as completed
                            return paymentResponse.complete('success');
                        } else {
                            // Mark the payment as failed
                            return paymentResponse.complete('fail');
                        }
                    });
            }
        })
        .catch((err) => {
            console.log('catch', err);
        });
}

// Handle payment form submission
form.addEventListener('submit', (e) => {
    e.preventDefault();
    makePayment();
});