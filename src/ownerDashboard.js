import React, { useState, useEffect } from 'react';
import { Camera, Upload, X, Edit2, Save, Plus, Trash2, Clock, MapPin, Car, Calendar } from 'lucide-react';
import styles from './css/ownerDashboard.module.css';
import { useNavigate } from 'react-router-dom';
import supabase from './supabaseClient'; // Import your actual Supabase client

const ParkingOwnerDashboard = () => {
  const [ownerData, setOwnerData] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSlot, setEditingSlot] = useState(null);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  // Replace this with your actual authentication logic
  // For example, from useAuth hook or Supabase auth
  const [ownerId, setOwnerId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Get current user from Supabase auth
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setOwnerId(user.id);
      } else {
        // Redirect to login or handle unauthenticated state
        console.log('User not authenticated');
      }
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (ownerId) {
      fetchDashboardData();
    }
  }, [ownerId]);

  const fetchDashboardData = async () => {
    if (!ownerId) return;
    
    try {
      // Fetch owner data
      const { data: ownerResult, error: ownerError } = await supabase
        .from('owner')
        .select('*')
        .eq('id', ownerId);
      
      if (ownerError) throw ownerError;
      
      // Fetch slots data
      const { data: slotsResult, error: slotsError } = await supabase
        .from('owner_slots')
        .select('*')
        .eq('owner_id', ownerId);

      if (slotsError) throw slotsError;

      setOwnerData(ownerResult[0]);
      setSlots(slotsResult || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch dashboard data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (slotId, files) => {
    const imageUrls = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${ownerId}_${slotId}_${Date.now()}_${i}.${fileExt}`;
      
      try {
        const { error: uploadError } = await supabase.storage
          .from('garage-images')
          .upload(fileName, file);
        
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage
          .from('garage-images')
          .getPublicUrl(fileName);
        
        imageUrls.push(data.publicUrl);
      } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload image: ' + error.message);
      }
    }
    
    return imageUrls;
  };

  const handleImageRemove = async (slotId, imageUrl) => {
    const slot = slots.find(s => s.id === slotId);
    const currentImages = JSON.parse(slot.parking_image || '[]');
    const updatedImages = currentImages.filter(img => img !== imageUrl);
    
    try {
      const { error } = await supabase
        .from('owner_slots')
        .update({ parking_image: JSON.stringify(updatedImages) })
        .eq('id', slotId);
      
      if (error) throw error;
      
      setSlots(slots.map(s => 
        s.id === slotId 
          ? { ...s, parking_image: JSON.stringify(updatedImages) }
          : s
      ));
      
      // Optionally remove the file from storage
      // Extract filename from URL and delete from storage if needed
      
    } catch (error) {
      console.error('Error removing image:', error);
      alert('Failed to remove image: ' + error.message);
    }
  };
  const handleDashboard = () => {
    navigate('/home')
  }

  const handleSlotUpdate = async (slotId, updates) => {
    try {
      const { error } = await supabase
        .from('owner_slots')
        .update(updates)
        .eq('id', slotId);
      
      if (error) throw error;
      
      setSlots(slots.map(s => 
        s.id === slotId ? { ...s, ...updates } : s
      ));
      
      setEditingSlot(null);
      alert('Updated successfully!');
    } catch (error) {
      console.error('Error updating slot:', error);
      alert('Failed to update: ' + error.message);
    }
  };

  const handleAddVehicleType = async (vehicleData) => {
    try {
      const newSlot = {
        ...vehicleData,
        owner_id: ownerId,
        available_slots: vehicleData.total_slots,
        status: 'available',
        created_at: new Date().toISOString(),
        vehicle_id: Math.max(...slots.map(s => s.vehicle_id || 0)) + 1
      };

      const { data, error } = await supabase
        .from('owner_slots')
        .insert([newSlot])
        .select();
      
      if (error) throw error;
      
      setSlots([...slots, data[0]]);
      setShowAddVehicle(false);
      alert('Vehicle type added successfully!');
    } catch (error) {
      console.error('Error adding vehicle type:', error);
      alert('Failed to add vehicle type: ' + error.message);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (window.confirm('Are you sure you want to remove this vehicle type?')) {
      try {
        const { error } = await supabase
          .from('owner_slots')
          .delete()
          .eq('id', slotId);
        
        if (error) throw error;
        
        setSlots(slots.filter(s => s.id !== slotId));
        alert('Vehicle type removed successfully!');
      } catch (error) {
        console.error('Error deleting slot:', error);
        alert('Failed to delete vehicle type: ' + error.message);
      }
    }
  };

   if (loading || !ownerId) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!ownerData) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <p className={styles.loadingText}>No owner data found. Please complete your registration first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.headerContent}>
            <div className={styles.headerFlex}>
              <div>
                <h1 className={styles.headerTitle}>
                  Welcome back, {ownerData?.first_name}!
                </h1>
                <p className={styles.headerSubtitle}>Manage your parking spaces</p> <br></br>
              </div>
              <div className={styles.headerLocation}>
                <div className={styles.locationInfo}>
                  <p className={styles.locationLabel}>Location</p>
                  <p className={styles.locationValue}>{ownerData?.city}</p>
                </div>
                <MapPin className={styles.locationIcon} />
              </div>
            </div>
             <button className={styles.homebutton} onClick={handleDashboard}> Home </button>
          </div>
        </div>
      </div>

      <div className={styles.mainContainer}>
        {/* Stats Overview */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <Car className={`${styles.statIcon} ${styles.statIconBlue}`} />
              <div>
                <p className={styles.statLabel}>Vehicle Types</p>
                <p className={styles.statValue}>{slots.length}</p>
              </div>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <Calendar className={`${styles.statIcon} ${styles.statIconGreen}`} />
              <div>
                <p className={styles.statLabel}>Total Slots</p>
                <p className={styles.statValue}>
                  {slots.reduce((sum, slot) => sum + (slot.total_slots || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <Clock className={`${styles.statIcon} ${styles.statIconPurple}`} />
              <div>
                <p className={styles.statLabel}>Available Slots</p>
                <p className={styles.statValue}>
                  {slots.reduce((sum, slot) => sum + (slot.available_slots || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <Upload className={`${styles.statIcon} ${styles.statIconOrange}`} />
              <div>
                <p className={styles.statLabel}>Status</p>
                <p className={styles.statStatus}>Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Types Management */}
        <div className={styles.vehicleTypesSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeaderFlex}>
              <h2 className={styles.sectionTitle}>Vehicle Types & Pricing</h2>
              <button
                onClick={() => setShowAddVehicle(true)}
                className={styles.addButton}
              >
                <Plus className={styles.addIcon} />
                Add Vehicle Type
              </button>
            </div>
          </div>

          <div className={styles.sectionContent}>
            {slots.length === 0 ? (
              <div className={styles.emptyState}>
                <Car className={styles.emptyIcon} />
                <p className={styles.emptyText}>No vehicle types configured yet</p>
              </div>
            ) : (
              <div className={styles.slotsContainer}>
                {slots.map((slot) => (
                  <VehicleSlotCard
                    key={slot.id}
                    slot={slot}
                    editingSlot={editingSlot}
                    setEditingSlot={setEditingSlot}
                    onUpdate={handleSlotUpdate}
                    onDelete={handleDeleteSlot}
                    onImageRemove={handleImageRemove}
                    onImageUpload={handleImageUpload}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Vehicle Type Modal */}
        {showAddVehicle && (
          <AddVehicleModal
            onClose={() => setShowAddVehicle(false)}
            onAdd={handleAddVehicleType}
          />
        )}
      </div>
    </div>
  );
};

const VehicleSlotCard = ({ slot, editingSlot, setEditingSlot, onUpdate, onDelete, onImageRemove, onImageUpload }) => {
  const [editData, setEditData] = useState({});
  const [newImages, setNewImages] = useState([]);
  
  const isEditing = editingSlot === slot.id;
  const images = JSON.parse(slot.parking_image || '[]');

  const handleEdit = () => {
    setEditData({
      pricing_type: slot.pricing_type,
      price: slot.price,
      total_slots: slot.total_slots,
      available_slots: slot.available_slots,
      opening_time: slot.opening_time,
      closing_time: slot.closing_time,
      status: slot.status
    });
    setEditingSlot(slot.id);
  };

  const handleSave = async () => {
    let updatedData = { ...editData };
    
    if (newImages.length > 0) {
      const uploadedUrls = await onImageUpload(slot.id, newImages);
      const currentImages = JSON.parse(slot.parking_image || '[]');
      updatedData.parking_image = JSON.stringify([...currentImages, ...uploadedUrls]);
    }
    
    onUpdate(slot.id, updatedData);
    setNewImages([]);
  };

  const handleImageSelect = (e) => {
    setNewImages([...newImages, ...Array.from(e.target.files)]);
  };

  return (
    <div className={styles.slotCard}>
      <div className={styles.slotHeader}>
        <h3 className={styles.slotTitle}>{slot.vehicletype}</h3>
        <div className={styles.slotActions}>
          {!isEditing ? (
            <>
              <button
                onClick={handleEdit}
                className={`${styles.actionButton} ${styles.actionButtonBlue}`}
              >
                <Edit2 className={styles.actionIcon} />
              </button>
              <button
                onClick={() => onDelete(slot.id)}
                className={`${styles.actionButton} ${styles.actionButtonRed}`}
              >
                <Trash2 className={styles.actionIcon} />
              </button>
            </>
          ) : (
            <div className={styles.saveCancelActions}>
              <button
                onClick={handleSave}
                className={styles.saveButton}
              >
                <Save className={styles.actionIcon} />
              </button>
              <button
                onClick={() => setEditingSlot(null)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Pricing Type</label>
          {isEditing ? (
            <select
              value={editData.pricing_type}
              onChange={(e) => setEditData({...editData, pricing_type: e.target.value})}
              className={styles.formSelect}
            >
              <option value="Hourly">Hourly</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          ) : (
            <p className={styles.formValue}>{slot.pricing_type}</p>
          )}
        </div>

        <div className={styles.formField}>
          <label className={styles.formLabel}>Price (₹)</label>
          {isEditing ? (
            <input
              type="number"
              value={editData.price}
              onChange={(e) => setEditData({...editData, price: parseFloat(e.target.value)})}
              className={styles.formInput}
            />
          ) : (
            <p className={styles.formValue}>₹{slot.price}</p>
          )}
        </div>

        <div className={styles.formField}>
          <label className={styles.formLabel}>Total Slots</label>
          {isEditing ? (
            <input
              type="number"
              value={editData.total_slots}
              onChange={(e) => setEditData({...editData, total_slots: parseInt(e.target.value)})}
              className={styles.formInput}
            />
          ) : (
            <p className={styles.formValue}>{slot.total_slots}</p>
          )}
        </div>

        <div className={styles.formField}>
          <label className={styles.formLabel}>Available Slots</label>
          {isEditing ? (
            <input
              type="number"
              value={editData.available_slots}
              onChange={(e) => setEditData({...editData, available_slots: parseInt(e.target.value)})}
              className={styles.formInput}
            />
          ) : (
            <p className={styles.formValue}>{slot.available_slots}</p>
          )}
        </div>
      </div>

      <div className={styles.formGrid3}>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Opening Time</label>
          {isEditing ? (
            <input
              type="time"
              value={editData.opening_time}
              onChange={(e) => setEditData({...editData, opening_time: e.target.value})}
              className={styles.formInput}
            />
          ) : (
            <p className={styles.formValue}>{slot.opening_time}</p>
          )}
        </div>

        <div className={styles.formField}>
          <label className={styles.formLabel}>Closing Time</label>
          {isEditing ? (
            <input
              type="time"
              value={editData.closing_time}
              onChange={(e) => setEditData({...editData, closing_time: e.target.value})}
              className={styles.formInput}
            />
          ) : (
            <p className={styles.formValue}>{slot.closing_time}</p>
          )}
        </div>

        <div className={styles.formField}>
          <label className={styles.formLabel}>Status</label>
          {isEditing ? (
            <select
              value={editData.status}
              onChange={(e) => setEditData({...editData, status: e.target.value})}
              className={styles.formSelect}
            >
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
              <option value="maintenance">Maintenance</option>
            </select>
          ) : (
            <span className={`${styles.statusBadge} ${
              slot.status === 'available' ? styles.statusAvailable :
              slot.status === 'unavailable' ? styles.statusUnavailable :
              styles.statusMaintenance
            }`}>
              {slot.status}
            </span>
          )}
        </div>
      </div>

      {/* Image Management */}
      <div className={styles.imageSection}>
        <label className={styles.formLabel}>Garage Images</label>
        <div className={styles.imageGrid}>
          {images.map((imageUrl, index) => (
            <div key={index} className={styles.imageContainer}>
              <img
                src={imageUrl}
                alt={`Garage ${index + 1}`}
                className={styles.imagePreview}
              />
              {isEditing && (
                <button
                  onClick={() => onImageRemove(slot.id, imageUrl)}
                  className={styles.imageRemoveButton}
                >
                  <X className={styles.removeIcon} />
                </button>
              )}
            </div>
          ))}
          
          {newImages.map((file, index) => (
            <div key={`new-${index}`} className={styles.imageContainer}>
              <img
                src={URL.createObjectURL(file)}
                alt={`New ${index + 1}`}
                className={`${styles.imagePreview} ${styles.imagePreviewNew}`}
              />
              <div className={styles.imageNewIndicator}>
                <Plus className={styles.plusIcon} />
              </div>
            </div>
          ))}
        </div>

        {isEditing && (
          <div className={styles.uploadControls}>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className={styles.fileInput}
              id={`image-upload-${slot.id}`}
            />
            <label
              htmlFor={`image-upload-${slot.id}`}
              className={styles.uploadButton}
            >
              <Camera className={styles.uploadIcon} />
              Add Images
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

const AddVehicleModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    vehicletype: '',
    pricing_type: 'Hourly',
    price: '',
    total_slots: '',
    opening_time: '',
    closing_time: '',
    parking_image: '[]'
  });

  const handleSubmit = () => {
    if (!formData.vehicletype || !formData.price || !formData.total_slots || !formData.opening_time || !formData.closing_time) {
      alert('Please fill in all required fields');
      return;
    }
    onAdd({
      ...formData,
      price: parseFloat(formData.price),
      total_slots: parseInt(formData.total_slots)
    });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Add Vehicle Type</h3>
          <button
            onClick={onClose}
            className={styles.modalClose}
          >
            <X className={styles.closeIcon} />
          </button>
        </div>

        <div className={styles.modalForm}>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Vehicle Type</label>
            <select
              value={formData.vehicletype}
              onChange={(e) => setFormData({...formData, vehicletype: e.target.value})}
              className={styles.formSelect}
              required
            >
              <option value="">Select Vehicle Type</option>
              <option value="Bike/Cycle">Bike/Cycle</option>
              <option value="Car/Auto">Car/Auto</option>
              <option value="Bus/Truck">Bus/Truck</option>
            </select>
          </div>

          <div className={styles.formField}>
            <label className={styles.formLabel}>Pricing Type</label>
            <select
              value={formData.pricing_type}
              onChange={(e) => setFormData({...formData, pricing_type: e.target.value})}
              className={styles.formSelect}
            >
              <option value="Hourly">Hourly</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>

          <div className={styles.formField}>
            <label className={styles.formLabel}>Price (₹)</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className={styles.formInput}
              required
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.formLabel}>Total Slots</label>
            <input
              type="number"
              value={formData.total_slots}
              onChange={(e) => setFormData({...formData, total_slots: e.target.value})}
              className={styles.formInput}
              required
            />
          </div>

          <div className={styles.modalGrid}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Opening Time</label>
              <input
                type="time"
                value={formData.opening_time}
                onChange={(e) => setFormData({...formData, opening_time: e.target.value})}
                className={styles.formInput}
                required
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Closing Time</label>
              <input
                type="time"
                value={formData.closing_time}
                onChange={(e) => setFormData({...formData, closing_time: e.target.value})}
                className={styles.formInput}
                required
              />
            </div>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={handleSubmit}
              className={styles.modalSubmit}
            >
              Add Vehicle Type
            </button>
            <button
              type="button"
              onClick={onClose}
              className={styles.modalCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingOwnerDashboard;