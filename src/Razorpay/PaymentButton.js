import supabase from "../supabaseClient";
import emailjs from '@emailjs/browser'; 

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

// Initialize EmailJS (add your public key here)
emailjs.init("cEmTMF-jynJSzyi3B"); // Replace with your actual EmailJS public key

// Function to send confirmation email using EmailJS
const sendConfirmationEmail = async (bookingDetails, paymentId) => {
  try {
    const templateParams = {
      to_email: bookingDetails.email,
      to_name: bookingDetails.name,
      payment_id: paymentId,
      vehicle_type: bookingDetails.vehicleType,
      vehicle_number: bookingDetails.vehicleNumber,
      start_time: new Date(bookingDetails.startTime).toLocaleString(),
      end_time: new Date(bookingDetails.endTime).toLocaleString(),
      duration: bookingDetails.duration,
      num_slots: bookingDetails.numSlots,
      rate: bookingDetails.rate,
      pricing_type: bookingDetails.pricingtype,
      total_amount: bookingDetails.total,
      booking_date: new Date().toLocaleDateString(),
      booking_time: new Date().toLocaleTimeString()
    };

    const result = await emailjs.send(
      'service_tmju92y',     // Replace with your EmailJS service ID
      'template_wl3wq3c',    // Replace with your EmailJS template ID
      templateParams
    );

    console.log('✅ Email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
};

// Function to save booking details to Supabase and update available slots
const saveBookingToSupabase = async (bookingDetails, paymentId) => {
  try {
    console.log("Booking details to save:", bookingDetails);
    
    // Start a transaction-like operation
    // First, get current available slots and check if booking is possible
    const { data: ownerSlotData, error: fetchError } = await supabase
      .from("owner_slots")
      .select("available_slots")
      .eq("id", bookingDetails.ownerSlotId)
      .single();

    if (fetchError) {
      console.error("❌ Error fetching owner slot data:", fetchError);
      alert("Error checking slot availability: " + fetchError.message);
      return false;
    }

    const currentAvailableSlots = parseInt(ownerSlotData.available_slots);
    const requestedSlots = parseInt(bookingDetails.numSlots);

    // Check if enough slots are available
    if (currentAvailableSlots < requestedSlots) {
      alert(`Only ${currentAvailableSlots} slots available. You requested ${requestedSlots} slots.`);
      return false;
    }

    // Calculate new available slots
    const newAvailableSlots = currentAvailableSlots - requestedSlots;

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
      rate: bookingDetails.rate,
      pricing_type: bookingDetails.pricingtype,
      total_amount: bookingDetails.total,
      duration_hours: bookingDetails.duration,
      user_id: bookingDetails.userId,
      owner_slot_id: bookingDetails.ownerSlotId,
      num_slots: bookingDetails.numSlots
    };
    
    console.log("Attempting to insert booking:", bookingRecord);
    
    // Insert booking data
    const { data: bookingData, error: bookingError } = await supabase
      .from("booking_data")
      .insert([bookingRecord]);

    if (bookingError) {
      console.error("❌ Supabase booking insert error:", bookingError);
      console.error("Error code:", bookingError.code);
      console.error("Error message:", bookingError.message);
      console.error("Error details:", bookingError.details);
      alert("Error saving booking: " + bookingError.message);
      return false;
    }

    console.log("✅ Booking saved to Supabase:", bookingData);

    // Update available slots in owner_slots table
    const { data: updateData, error: updateError } = await supabase
      .from("owner_slots")
      .update({ 
        available_slots: newAvailableSlots.toString(),
        // Optionally update status if no slots remaining
        ...(newAvailableSlots === 0 && { status: 'fully_booked' })
      })
      .eq("id", bookingDetails.ownerSlotId);

    if (updateError) {
      console.error("❌ Error updating available slots:", updateError);
      // This is critical - we should ideally rollback the booking insert
      // For now, we'll alert the user about the issue
      alert("Booking saved but failed to update slot availability. Please contact support.");
      return false;
    }

    console.log("✅ Available slots updated:", updateData);
    console.log(`Slots reduced from ${currentAvailableSlots} to ${newAvailableSlots}`);
    
    return true;

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
    handler: async function (response) {
      alert("Payment successful! Payment ID: " + response.razorpay_payment_id);
      console.log("Payment Success", response);
      
      // Save the booking to Supabase and update available slots
      const bookingSaved = await saveBookingToSupabase(bookingDetails, response.razorpay_payment_id);
      
      if (bookingSaved) {
        // Send confirmation email
        const emailSent = await sendConfirmationEmail(bookingDetails, response.razorpay_payment_id);
        
        if (emailSent) {
          alert("Booking confirmed! A confirmation email has been sent to " + bookingDetails.email);
        } else {
          alert("Booking saved but failed to send confirmation email. Please contact support if needed.");
        }
      }
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
      rate: bookingDetails?.rate || "",
      pricingType: bookingDetails?.pricingType || "", 
    },
    theme: {
      color: "#0e76a8", // Theme color of the payment window
    },
  };

  const paymentObject = new window.Razorpay(options);
  paymentObject.open();
};