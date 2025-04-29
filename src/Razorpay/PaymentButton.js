
// Function to dynamically load Razorpay SDK script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      resolve(false);
    };

    document.body.appendChild(script);
  });
};

// Main function to handle payment
export const handlePayment = async () => {
  const res = await loadRazorpayScript();

  if (!res) {
    alert("Razorpay SDK failed to load. Are you online?");
    return;
  }

  const options = {
    key: "rzp_test_grMytIcY5TuC0o",  // 👉 Replace with your real Razorpay Key ID
    amount: 2700,                 // 👉 Amount in paise (₹27.00)
    currency: "INR",
    name: "Parking Booking",
    description: "Booking Payment for Garage 1",
    image: "https://yourdomain.com/logo.png", // Optional - add your logo URL if you want
    handler: function (response) {
      alert("Payment successful! Payment ID: " + response.razorpay_payment_id);
      console.log("Payment Success", response);
    },
    prefill: {
      name: "Your Name",             // Optional - can fill user's name
      email: "youremail@example.com", // Optional - fill user's email
      contact: "9999999999",          // Optional - fill user's contact
    },
    notes: {
      address: "Parking Garage Address",
    },
    theme: {
      color: "#0e76a8", // Theme color of the payment window
    },
  };

  const paymentObject = new window.Razorpay(options);
  paymentObject.open();
};

