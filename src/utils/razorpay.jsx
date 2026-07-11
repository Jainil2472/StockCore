// utils/razorpay.js

// Load Razorpay script dynamically
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Initialize Razorpay checkout
export const initiateRazorpayPayment = async ({
  subscriptionId,
  razorpayKey,
  planName,
  onSuccess,
  onFailure
}) => {
  try {
    // Load Razorpay script
    const scriptLoaded = await loadRazorpayScript();
    
    if (!scriptLoaded) {
      alert('Failed to load Razorpay SDK. Please try again.');
      return;
    }

    // Razorpay options
    const options = {
      key: razorpayKey,
      subscription_id: subscriptionId,
      name: 'Stock Management SaaS',
      description: `${planName} Plan Subscription`,
      
      handler: function (response) {
        // Payment successful
        console.log('Payment Response:', response);
        if (onSuccess) {
          onSuccess(response);
        }
      },
      
      modal: {
        ondismiss: function() {
          if (onFailure) {
            onFailure(new Error('Payment cancelled by user'));
          }
        }
      },
      
      theme: {
        color: '#3399cc'
      }
    };

    // Open Razorpay checkout
    const razorpay = new window.Razorpay(options);
    razorpay.open();
    
  } catch (error) {
    console.error('Razorpay initialization error:', error);
    if (onFailure) {
      onFailure(error);
    }
  }
};