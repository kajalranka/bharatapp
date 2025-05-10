import supabase from "../supabaseClient"; 

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

// Function to save booking details to Supabase
const saveBookingToSupabase = async (bookingDetails, paymentId) => {
  try {
    console.log("Booking details to save:", bookingDetails);
    
    // Create booking object matching your existing table structure
    const bookingRecord = {
      // Using form_data table structure based on your SQL
      first_name: bookingDetails.name?.split(' ')[0] || "",
      last_name: bookingDetails.name?.split(' ')[1] || "",
      email: bookingDetails.email || "",
      phone_number: bookingDetails.phoneNumber || "",
      vehicle_types: [bookingDetails.vehicleType],
      status: "booked",
      created_at: new Date().toISOString(),
      
      // Additional booking-specific fields
      payment_id: paymentId,
      booking_start: new Date(bookingDetails.startTime).toISOString(),
      booking_end: new Date(bookingDetails.endTime).toISOString(),
      vehicle_number: bookingDetails.vehicleNumber,
      total_amount: bookingDetails.total,
      duration_hours: bookingDetails.duration
    };
    
    console.log("Attempting to insert:", bookingRecord);
    
    // Insert into form_data table instead of bookingDetails
    const { data, error } = await supabase
      .from("booking_data")
      .insert([bookingRecord]);

    if (error) {
      console.error("❌ Supabase insert error:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error details:", error.details);
      alert("Error saving booking: " + error.message);
      return false;
    } else {
      console.log("✅ Booking saved to Supabase:", data);
      return true;
    }
  } catch (err) {
    console.error("Failed to save booking:", err);
    alert("Failed to save booking. Please contact support.");
    return false;
  }
};

// Main function to handle payment
export const handlePayment = async (bookingDetails) => {
  const res = await loadRazorpayScript();

  if (!res) {
    alert("Razorpay SDK failed to load. Are you online?");
    return;
  }

  // Get the amount from booking details or use a default
  const amount = bookingDetails?.total || 0;
  
  // Convert amount to paise (multiply by 100)
  const amountInPaise = Math.round(amount * 100);

  const options = {
    key: "rzp_test_grMytIcY5TuC0o",  // Replace with your real Razorpay Key ID
    amount: amountInPaise,           // Amount in paise
    currency: "INR",
    name: "Parking Booking",
    description: `Parking Booking for ${bookingDetails?.vehicleType || 'Vehicle'}`,
    image: "https://yourdomain.com/logo.png", // Optional - add your logo URL
    handler: function (response) {
      alert("Payment successful! Payment ID: " + response.razorpay_payment_id);
      console.log("Payment Success", response);
      
      // Save the booking to Supabase
      saveBookingToSupabase(bookingDetails, response.razorpay_payment_id);
    },
    prefill: {
      name: bookingDetails?.name || "Customer",
      email: bookingDetails?.email || "",
      contact: bookingDetails?.phoneNumber || "",
    },
    notes: {
      vehicleNumber: bookingDetails?.vehicleNumber || "",
      slotType: bookingDetails?.slotType || "",
      startTime: bookingDetails?.startTime || "",
      endTime: bookingDetails?.endTime || "",
    },
    theme: {
      color: "#0e76a8", // Theme color of the payment window
    },
  };

  const paymentObject = new window.Razorpay(options);
  paymentObject.open();
};