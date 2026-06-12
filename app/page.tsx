"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";

// Data save karne ka function (With LocalStorage Backup)
const SAVE_TO_MONGO = async (data: any, collection: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`hotel_midway_${collection}`, JSON.stringify(data));
  }
  try {
    await fetch('/api/mongo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection, data })
    });
  } catch (error) {
    console.error('Save error:', error);
  }
};

const LOAD_FROM_MONGO = async (collection: string) => {
  try {
    const res = await fetch(`/api/mongo?collection=${collection}`);
    if (res.ok) {
      const data = await res.json();
      if (data) return data;
    }
  } catch (error) {
    console.error('Load error:', error);
  }
  
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(`hotel_midway_${collection}`);
    return local ? JSON.parse(local) : null;
  }
  return null;
};

const compressImage = (file: any, maxSizeMB = 0.5) => {
  return new Promise((resolve, reject) => {
    if (file.size / (1024 * 1024) <= maxSizeMB) {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event: any) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > 1200) {
          height = (height * 1200) / width;
          width = 1200;
        }
 
        if (height > 1200) {
          width = (width * 1200) / height;
          height = 1200;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedDataUrl);
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const defaultRooms = [
  { id: 1, name: "Deluxe King Room", category: "deluxe", price: 4999, image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&q=80", description: "Spacious king-size bed with premium amenities", amenities: ["AC", "WiFi", "TV", "Mini Bar", "Room Service"], size: "320 sq ft", capacity: 2, baseOccupancy: 2, extraPersonCharge: 300, available: true },
  { id: 2, name: "Executive Suite", category: "suite", price: 8999, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80", description: "Luxury suite with separate living area", amenities: ["AC", "WiFi", "TV", "Bathtub", "Living Area", "Mini Bar"], size: "550 sq ft", capacity: 3, baseOccupancy: 2, extraPersonCharge: 300, available: true },
  { id: 3, name: "Standard Twin Room", category: "standard", price: 2999, image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&q=80", description: "Comfortable twin beds for business travelers", amenities: ["AC", "WiFi", "TV", "Work Desk"], size: "280 sq ft", capacity: 2, baseOccupancy: 2, extraPersonCharge: 300, available: true },
  { id: 4, name: "Premium Ocean View", category: "premium", price: 6999, image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80", description: "Ocean view room with private balcony", amenities: ["AC", "WiFi", "TV", "Balcony", "Ocean View", "Mini Bar"], size: "400 sq ft", capacity: 2, baseOccupancy: 2, extraPersonCharge: 300, available: true },
  { id: 5, name: "Family Suite", category: "suite", price: 12999, image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80", description: "Perfect for family with 2 bedrooms", amenities: ["AC", "WiFi", "TV", "Kitchenette", "Living Room", "2 Bathrooms"], size: "750 sq ft", capacity: 5, baseOccupancy: 4, extraPersonCharge: 300, available: true },
  { id: 6, name: "Budget Single Room", category: "standard", price: 1999, image: "https://images.unsplash.com/photo-1631049035182-249067d7618e?w=600&q=80", description: "Cozy single room for solo travelers", amenities: ["AC", "WiFi", "TV"], size: "200 sq ft", capacity: 1, baseOccupancy: 1, extraPersonCharge: 300, available: true },
];

const defaultGallery = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80",
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&q=80",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80",
];

const defaultContacts = {
  phones: ["+91 98765 43210", "+91 98765 43211"],
  emails: ["reservations@hotelmidway.com", "info@hotelmidway.com"]
};

const defaultHotelInfo = {
  address: "Slapper - Khurahal Rd, near ACC Cement Plant, Tehsil Barmana, District Mandi, Himachal Pradesh 175017",
  checkIn: "12:00 PM",
  checkOut: "11:00 AM"
};

const defaultReviews = [
  { id: 1, name: "Rahul Sharma", email: "rahul@example.com", rating: 5, comment: "Amazing hotel! Great service and beautiful rooms. Highly recommended!", date: "2024-01-15" },
  { id: 2, name: "Priya Patel", email: "priya@example.com", rating: 4, comment: "Very comfortable stay. Food was delicious and staff was friendly.", date: "2024-01-20" },
  { id: 3, name: "Amit Kumar", email: "amit@example.com", rating: 5, comment: "Best hotel in town! The ocean view room was spectacular.", date: "2024-02-01" },
];

const defaultTouristSpots = [
  {
    id: 1,
    name: "Mall Road",
    summary: "Famous shopping street with beautiful mountain views and local handicrafts",
    distance: "2 km away from our hotel",
    image: "https://images.unsplash.com/photo-1626621341517-bbfa4f9b4cf9?w=600&q=80",
    rating: 4.5,
    googleMapsLink: "https://maps.google.com/?q=Mall+Road+Manali"
  },
  {
    id: 2,
    name: "Hadimba Temple",
    summary: "Ancient cave temple dedicated to Hidimba Devi, surrounded by cedar forest",
    distance: "3 km away from our hotel",
    image: "https://images.unsplash.com/photo-1626621341517-bbfa4f9b4cf9?w=600&q=80",
    rating: 4.7,
    googleMapsLink: "https://maps.google.com/?q=Hadimba+Temple+Manali"
  },
  {
    id: 3,
    name: "Solang Valley",
    summary: "Adventure sports paradise with paragliding, skiing and snow activities",
    distance: "13 km away from our hotel",
    image: "https://images.unsplash.com/photo-1626621341517-bbfa4f9b4cf9?w=600&q=80",
    rating: 4.8,
    googleMapsLink: "https://maps.google.com/?q=Solang+Valley+Manali"
  },
  {
    id: 4,
    name: "Rohtang Pass",
    summary: "High mountain pass with snow-capped peaks and breathtaking views",
    distance: "51 km away from our hotel",
    image: "https://images.unsplash.com/photo-1626621341517-bbfa4f9b4cf9?w=600&q=80",
    rating: 4.9,
    googleMapsLink: "https://maps.google.com/?q=Rohtang+Pass+Manali"
  }
];

const ADMIN_PASSWORD = "hoteladmin123";

export default function HotelMidway() {
  const [rooms, setRooms] = useState(defaultRooms);
  const [hotelInfo, setHotelInfo] = useState(defaultHotelInfo);
  const [contacts, setContacts] = useState(defaultContacts);
  const [bookings, setBookings] = useState<any[]>([]);
  const [reviews, setReviews] = useState(defaultReviews);
  const [gallery, setGallery] = useState(defaultGallery);
  const [heroBg, setHeroBg] = useState("https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80");
  const [touristSpots, setTouristSpots] = useState(defaultTouristSpots);
  
  const [loading, setLoading] = useState(true);
  const [isFetched, setIsFetched] = useState(false);
  
  const [view, setView] = useState("home");
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [adminTab, setAdminTab] = useState("dashboard");
  const [toast, setToast] = useState<any>(null);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [roomDetailModal, setRoomDetailModal] = useState(false);
  const [bookingModal, setBookingModal] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [editRoom, setEditRoom] = useState<any>(null);
  const [editSpot, setEditSpot] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookingFilter, setBookingFilter] = useState("all");
  const [bookingSearch, setBookingSearch] = useState("");
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [bookingDetails, setBookingDetails] = useState({ name: "", phone: "", email: "", checkIn: "", checkOut: "", guests: 1 });
  const [newReview, setNewReview] = useState({ name: "", email: "", phone: "", rating: 5, comment: "" });
  const [newRoom, setNewRoom] = useState({ name: "", category: "deluxe", price: "", image: "", description: "", amenities: "", size: "", capacity: "", baseOccupancy: "", extraPersonCharge: "" });
  const [newSpot, setNewSpot] = useState({ name: "", summary: "", distance: "", image: "", rating: 5, googleMapsLink: "" });
  const [editInfo, setEditInfo] = useState(hotelInfo);
  const [heroPreview, setHeroPreview] = useState(heroBg);
  
  const roomImageRef = useRef<any>(null);
  const galleryImageRef = useRef<any>(null);
  const heroImageRef = useRef<any>(null);
  const spotImageRef = useRef<any>(null);

  const getCleanData = (res: any) => {
    if (!res) return null;
    if (Array.isArray(res)) {
      if (res.length === 0) return null;
      if (res[0] && res[0].data !== undefined) return res[0].data;
      return res; 
    }
    return res.data !== undefined ? res.data : res;
  };

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      
      const roomsRes = await LOAD_FROM_MONGO('rooms');
      const roomsData = getCleanData(roomsRes);
      if (roomsData && Array.isArray(roomsData) && roomsData.length > 0) setRooms(roomsData);
      
      const bookingsRes = await LOAD_FROM_MONGO('bookings');
      const bookingsData = getCleanData(bookingsRes);
      if (bookingsData && Array.isArray(bookingsData)) setBookings(bookingsData);
      
      const reviewsRes = await LOAD_FROM_MONGO('reviews');
      const reviewsData = getCleanData(reviewsRes);
      if (reviewsData && Array.isArray(reviewsData) && reviewsData.length > 0) setReviews(reviewsData);
      
      const infoRes = await LOAD_FROM_MONGO('hotelinfo');
      const infoData = getCleanData(infoRes);
      if (infoData && infoData.address) {
        setHotelInfo(infoData);
        setEditInfo(infoData);
      }
      
      const contactsRes = await LOAD_FROM_MONGO('contacts');
      const contactsData = getCleanData(contactsRes);
      if (contactsData && (contactsData.phones || contactsData.emails)) setContacts(contactsData);
      
      const galleryRes = await LOAD_FROM_MONGO('gallery');
      const galleryData = getCleanData(galleryRes);
      if (galleryData) {
        if (galleryData.images) setGallery(galleryData.images);
        if (galleryData.heroBg) {
          setHeroBg(galleryData.heroBg);
          setHeroPreview(galleryData.heroBg);
        }
      }
      
      const spotsRes = await LOAD_FROM_MONGO('touristSpots');
      const spotsData = getCleanData(spotsRes);
      if (spotsData && Array.isArray(spotsData) && spotsData.length > 0) setTouristSpots(spotsData);
      
      setIsFetched(true);
      setLoading(false);
    };
    
    loadAllData();
  }, []);

  useEffect(() => {
    if (isFetched && !loading) SAVE_TO_MONGO(rooms, 'rooms');
  }, [rooms, loading, isFetched]);

  useEffect(() => {
    if (isFetched && !loading) SAVE_TO_MONGO(bookings, 'bookings');
  }, [bookings, loading, isFetched]);

  useEffect(() => {
    if (isFetched && !loading) SAVE_TO_MONGO(reviews, 'reviews');
  }, [reviews, loading, isFetched]);

  useEffect(() => {
    if (isFetched && !loading) SAVE_TO_MONGO(hotelInfo, 'hotelinfo');
  }, [hotelInfo, loading, isFetched]);

  useEffect(() => {
    if (isFetched && !loading) SAVE_TO_MONGO(contacts, 'contacts');
  }, [contacts, loading, isFetched]);

  useEffect(() => {
    if (isFetched && !loading) SAVE_TO_MONGO({ images: gallery, heroBg: heroBg }, 'gallery');
  }, [gallery, heroBg, loading, isFetched]);

  useEffect(() => {
    if (isFetched && !loading) SAVE_TO_MONGO(touristSpots, 'touristSpots');
  }, [touristSpots, loading, isFetched]);

  const showToast = (msg: string, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const openRoomDetail = (room: any) => {
    setSelectedRoom(room);
    setRoomDetailModal(true);
  };
  const proceedToBook = () => {
    setRoomDetailModal(false);
    setBookingModal(true);
  };
  const addPhone = () => {
    if (!newPhone.trim()) return showToast("Enter phone number", "error");
    setContacts(prev => ({ ...prev, phones: [...prev.phones, newPhone.trim()] }));
    setNewPhone("");
    showToast("Phone added!");
  };
  const deletePhone = (index: number) => {
    setContacts(prev => ({ ...prev, phones: prev.phones.filter((_, i) => i !== index) }));
    showToast("Phone removed!");
  };

  const addEmail = () => {
    if (!newEmail.trim()) return showToast("Enter email address", "error");
    if (!newEmail.includes("@")) return showToast("Invalid email", "error");
    setContacts(prev => ({ ...prev, emails: [...prev.emails, newEmail.trim()] }));
    setNewEmail("");
    showToast("Email added!");
  };
  const deleteEmail = (index: number) => {
    setContacts(prev => ({ ...prev, emails: prev.emails.filter((_, i) => i !== index) }));
    showToast("Email removed!");
  };

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setCurrentImage(gallery[index]);
    setLightboxOpen(true);
  };
  const closeLightbox = () => {
    setLightboxOpen(false);
  };
  const nextImage = () => {
    const nextIndex = (currentImageIndex + 1) % gallery.length;
    setCurrentImageIndex(nextIndex);
    setCurrentImage(gallery[nextIndex]);
  };
  const prevImage = () => {
    const prevIndex = (currentImageIndex - 1 + gallery.length) % gallery.length;
    setCurrentImageIndex(prevIndex);
    setCurrentImage(gallery[prevIndex]);
  };

  useEffect(() => {
    const handleKeyDown = (e: any) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, currentImageIndex, gallery.length]);

  const uploadRoomImage = async (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      showToast("Processing image...", "success");
      try {
        const compressed = await compressImage(file);
        setNewRoom(prev => ({ ...prev, image: compressed as string }));
        showToast("Image uploaded & compressed!");
      } catch (error) {
        showToast("Error processing image", "error");
      } finally {
        setUploading(false);
      }
    }
  };
  
  const uploadSpotImage = async (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      showToast("Processing image...", "success");
      try {
        const compressed = await compressImage(file);
        setNewSpot(prev => ({ ...prev, image: compressed as string }));
        showToast("Image uploaded & compressed!");
      } catch (error) {
        showToast("Error processing image", "error");
      } finally {
        setUploading(false);
      }
    }
  };
  
  const uploadGalleryImage = async (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      showToast("Processing image...", "success");
      try {
        const compressed = await compressImage(file);
        setGallery(prev => [...prev, compressed as string]);
        showToast("Gallery image added!");
      } catch (error) {
        showToast("Error processing image", "error");
      } finally {
        setUploading(false);
      }
    }
  };
  const uploadHeroImage = async (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      showToast("Processing image...", "success");
      try {
        const compressed = await compressImage(file);
        setHeroBg(compressed as string);
        setHeroPreview(compressed as string);
        showToast("Hero background updated!");
      } catch (error) {
        showToast("Error processing image", "error");
      } finally {
        setUploading(false);
      }
    }
  };
  const deleteGalleryImage = (idx: number) => { 
    setGallery(prev => prev.filter((_, i) => i !== idx)); 
    showToast("Image deleted!"); 
  };
  const handleBooking = (room: any) => { 
    setSelectedRoom(room); 
    setBookingModal(true); 
  };
  
  const submitBooking = () => {
    if (!bookingDetails.name) return showToast("Please enter your name", "error");
    if (!bookingDetails.phone || bookingDetails.phone.length !== 10) return showToast("Please enter valid 10-digit phone number", "error");
    if (!bookingDetails.email || !bookingDetails.email.includes('@')) return showToast("Please enter valid email address", "error");
    if (!bookingDetails.checkIn) return showToast("Please select check-in date", "error");
    if (!bookingDetails.checkOut) return showToast("Please select check-out date", "error");
    if (new Date(bookingDetails.checkIn) < new Date()) return showToast("Cannot select past date for check-in", "error");
    if (new Date(bookingDetails.checkOut) <= new Date(bookingDetails.checkIn)) return showToast("Check-out must be after check-in", "error");
    if (bookingDetails.guests > selectedRoom.capacity) return showToast(`Maximum ${selectedRoom.capacity} guests allowed`, "error");
    
    const nights = Math.ceil((new Date(bookingDetails.checkOut).getTime() - new Date(bookingDetails.checkIn).getTime()) / (1000*60*60*24));
    
    // ✅ Sirf room price × nights (extra charge nahi)
    const totalPrice = selectedRoom.price * nights;
    
    setBookings(prev => [{ 
      id: Date.now(), 
      room: selectedRoom, 
      customer: bookingDetails, 
      nights, 
      totalPrice,
      date: new Date().toLocaleString(), 
      status: "Confirmed" 
    }, ...prev]);
    
    setBookingModal(false);
    setBookingDetails({ name: "", phone: "", email: "", checkIn: "", checkOut: "", guests: 1 });
    setSelectedRoom(null);
    showToast("Booking confirmed! We'll contact you soon.");
  };

  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  const showBookingConfirmationPopup = () => {
    if (
      !bookingDetails.name ||
      !bookingDetails.phone || 
      bookingDetails.phone.length !== 10 ||
      !bookingDetails.email || 
      !bookingDetails.email.includes('@') ||
      !bookingDetails.checkIn ||
      !bookingDetails.checkOut ||
      new Date(bookingDetails.checkIn) < new Date() ||
      new Date(bookingDetails.checkOut) <= new Date(bookingDetails.checkIn)
    ) {
      showToast("Please fill all details correctly", "error");
      return;
    }
    
    setShowPaymentPopup(true);
  };

  const confirmBookingWithPayment = () => {
    setShowPaymentPopup(false);
    submitBooking();
  };

  const updateBookingStatus = (bookingId: number, newStatus: string) => {
    setBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, status: newStatus } : b
    ));
    showToast(`Booking ${newStatus.toLowerCase()}!`);
  };

  const deleteBooking = (bookingId: number) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      setBookings(prev => prev.filter(b => b.id !== bookingId));
      showToast("Booking deleted!", "error");
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Confirmed": return "#28a745";
      case "Pending": return "#ffc107";
      case "Cancelled": return "#dc3545";
      default: return "#6c757d";
    }
  };
  
  const getFilteredBookings = () => {
    let filtered = bookings;
    if (bookingFilter !== "all") {
      filtered = filtered.filter(b => b.status === bookingFilter);
    }
    if (bookingSearch) {
      filtered = filtered.filter(b => 
        b.customer.name.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.customer.phone.includes(bookingSearch)
      );
    }
    return filtered;
  };

  const submitReview = () => {
    if (!newReview.name) return showToast("Please enter your name", "error");
    if (!newReview.email || !newReview.email.includes('@')) return showToast("Please enter valid email address", "error");
    if (!newReview.phone || newReview.phone.length !== 10) return showToast("Please enter valid 10-digit phone number", "error");
    if (!newReview.comment) return showToast("Please enter your comment", "error");
    
    setReviews(prev => [{ 
      id: Date.now(), 
      name: newReview.name,
      email: newReview.email,
      phone: newReview.phone,
      rating: newReview.rating, 
      comment: newReview.comment, 
      date: new Date().toLocaleString() 
    }, ...prev]);
    setReviewModal(false);
    setNewReview({ name: "", email: "", phone: "", rating: 5, comment: "" });
    showToast("Thank you for your review!");
  };
  
  const deleteReview = (reviewId: number) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      showToast("Review deleted!", "error");
    }
  };

  const deleteRoom = (id: number) => { 
    setRooms(prev => prev.filter(r => r.id !== id));
    showToast("Room removed", "error"); 
  };
  
  const saveRoom = () => {
    if (!newRoom.name || !newRoom.price) return showToast("Name & price required", "error");
    const amenitiesArray = newRoom.amenities ? (typeof newRoom.amenities === 'string' ? newRoom.amenities.split(",").map((a: string) => a.trim()) : newRoom.amenities) : [];
    if (editRoom) {
      setRooms(prev => prev.map(r => r.id === editRoom.id ? { 
        ...newRoom, 
        id: editRoom.id, 
        price: +newRoom.price, 
        amenities: amenitiesArray, 
        capacity: +newRoom.capacity, 
        baseOccupancy: +(newRoom.baseOccupancy || 2), 
        extraPersonCharge: +(newRoom.extraPersonCharge || 300),
        available: true
      } : r));
      showToast("Room updated!");
    } else {
      setRooms(prev => [...prev, { 
        ...newRoom, 
        id: Date.now(), 
        price: +newRoom.price, 
        amenities: amenitiesArray, 
        capacity: +newRoom.capacity, 
        baseOccupancy: +(newRoom.baseOccupancy || 2), 
        extraPersonCharge: +(newRoom.extraPersonCharge || 300), 
        available: true 
      }]);
      showToast("Room added!");
    }
    setNewRoom({ name: "", category: "deluxe", price: "", image: "", description: "", amenities: "", size: "", capacity: "", baseOccupancy: "", extraPersonCharge: "" });
    setEditRoom(null);
  };
  
  const startEdit = (r: any) => { 
    setEditRoom(r); 
    setNewRoom({ ...r, price: String(r.price), amenities: Array.isArray(r.amenities) ? r.amenities.join(", ") : r.amenities, capacity: String(r.capacity), baseOccupancy: String(r.baseOccupancy || 2), extraPersonCharge: String(r.extraPersonCharge || 300) });
    setAdminTab("add"); 
  };
  
  const saveSpot = () => {
    if (!newSpot.name || !newSpot.image) return showToast("Name and image required", "error");
    if (editSpot) {
      setTouristSpots(prev => prev.map(s => s.id === editSpot.id ? { ...newSpot, id: editSpot.id } : s));
      showToast("Spot updated!");
    } else {
      setTouristSpots(prev => [...prev, { ...newSpot, id: Date.now() }]);
      showToast("Spot added!");
    }
    setNewSpot({ name: "", summary: "", distance: "", image: "", rating: 5, googleMapsLink: "" });
    setEditSpot(null);
    setAdminTab("touristSpots");
  };
  
  const saveInfo = () => { 
    setHotelInfo(editInfo); 
    showToast("Hotel info updated!"); 
  };
  
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;
  const filteredRooms = rooms;

  const adminMenuItems = [
    { id: "dashboard", label: "📊 Dashboard", name: "Dashboard" },
    { id: "rooms", label: "🛏️ Rooms", name: "Rooms" },
    { id: "add", label: editRoom ? "✏️ Edit Room" : "➕ Add Room", name: editRoom ? "Edit Room" : "Add Room" },
    { id: "bookings", label: "📋 Bookings", name: "Bookings" },
    { id: "reviews", label: "⭐ Reviews", name: "Reviews" },
    { id: "touristSpots", label: "🏞️ Tourist Spots", name: "Tourist Spots" },
    { id: "gallery", label: "🖼️ Gallery", name: "Gallery" },
    { id: "info", label: "🏪 Hotel Info", name: "Hotel Info" },
    { id: "contacts", label: "📞 Contacts", name: "Contacts" },
    { id: "appearance", label: "🎨 Appearance", name: "Appearance" }
  ];
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#faf8f5' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, color: '#b8860b', marginBottom: 16 }}>🏨 Hotel Midway</div>
          <div style={{ fontSize: 14, color: '#666' }}>Loading your hotel data...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: "#faf8f5", minHeight: "100vh", color: "#1a1a1a" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Montserrat:wght@300;400;500;600&family=Poppins:wght@300;400;500;600&display=swap');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .nav-link { font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #666; cursor: pointer; transition: 0.3s; }
        .nav-link:hover, .nav-link.active { color: #b8860b; }
       
        .btn-gold { background: #b8860b; color: #fff; border: none; padding: 10px 28px; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; transition: 0.3s; border-radius: 4px; }
        .btn-gold:hover { background: #9a7209; transform: translateY(-2px); }
        .btn-outline { background: transparent; color: #b8860b; border: 1px solid #b8860b; padding: 8px 24px; font-size: 10px; letter-spacing: 2px; cursor: pointer; transition: 0.3s; border-radius: 4px; }
        .btn-outline:hover { background: #b8860b; color: #fff; }
        .card-hover { transition: 0.3s; border-radius: 12px; overflow: hidden; cursor: pointer; }
        .card-hover:hover { transform: translateY(-5px); box-shadow: 0 20px 30px -12px rgba(0,0,0,0.1); }
        .input-field { background: #fff; border: 1px solid #e0d5c5; padding: 12px 14px; font-size: 13px; width: 100%; outline: none; border-radius: 8px; transition: 0.2s; }
        .input-field:focus { border-color: #b8860b; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px; overflow-y: auto; }
        .modal-content { background: #fff; border-radius: 16px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 10001; }
        .modal-close { position: sticky; top: 15px; right: 20px; float: right; cursor: pointer; font-size: 28px; color: #999; z-index: 10; background: #fff; border-radius: 50%; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; }
        .modal-close:hover { color: #dc3545; }
        .amenity-badge { display: inline-block; background: #f0e8dd; color: #b8860b; padding: 4px 12px; border-radius: 20px; font-size: 11px; margin: 3px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes toastIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        .slide-in { animation: slideIn 0.3s ease forwards; }
        .toast-anim { animation: toastIn 0.3s ease forwards; }
        .star { color: #ffc107; }
        .lightbox { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 20000; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .lightbox-image { max-width: 90%; max-height: 90%; object-fit: contain; cursor: default; }
        .lightbox-close { position: absolute; top: 20px; right: 40px; color: #fff; font-size: 40px; cursor: pointer; z-index: 20001; transition: 0.3s; }
        .lightbox-close:hover { color: #b8860b; }
        .lightbox-prev, .lightbox-next { position: absolute; top: 50%; transform: translateY(-50%); color: #fff; font-size: 50px; cursor: pointer; padding: 20px; transition: 0.3s; z-index: 20001; }
        .lightbox-prev:hover, .lightbox-next:hover { color: #b8860b; }
        .lightbox-prev { left: 20px; }
        .lightbox-next { right: 20px; }
        .contact-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee; }
        
        .desktop-nav { display: flex; gap: 32px; }
        .hamburger { display: none; cursor: pointer; font-size: 24px; color: #b8860b; }
        .mobile-menu { position: fixed; top: 0; right: -280px; width: 260px; height: 100vh; background: #fff; z-index: 2000; transition: right 0.3s ease; box-shadow: -2px 0 10px rgba(0,0,0,0.1); padding: 80px 20px 30px; }
        .mobile-menu.open { right: 0; }
        .mobile-menu-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1999; display: none; }
        .mobile-menu-overlay.open { display: block; }
        .mobile-nav-link { display: block; padding: 15px 0; font-size: 16px; letter-spacing: 2px; text-transform: uppercase; color: #666; cursor: pointer; border-bottom: 1px solid #eee; }
        .mobile-nav-link:hover, .mobile-nav-link.active { color: #b8860b; }
        .mobile-close { position: absolute; top: 20px; right: 20px; font-size: 28px; cursor: pointer; color: #999; }
        .mobile-close:hover { color: #dc3545; }
        
        .admin-panel-container {
          position: fixed;
          inset: 0;
          z-index: 6000;
          background: rgba(0,0,0,0.5);
        }
        .admin-sidebar-fixed {
          position: fixed;
          top: 0;
          left: 0;
          width: 280px;
          height: 100vh;
          background: #1a1a1a;
          z-index: 6100;
          overflow-y: auto;
          border-right: 1px solid #333;
        }
        .admin-content-fixed {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          left: 280px;
          background: #f5f5f5;
          overflow-y: auto;
          z-index: 6000;
          padding: 30px;
        }
        .admin-login-box {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: #fff;
          border-radius: 16px;
          padding: 40px;
          width: 380px;
          z-index: 6200;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          margin: 4px 8px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          color: #888;
        }
        .admin-nav-item:hover {
          background: #2a2a2a;
          color: #b8860b;
        }
        .admin-nav-item.active {
          background: #b8860b;
          color: #fff;
        }
        .dashboard-card {
          background: #fff;
          border-radius: 16px;
          padding: 20px;
          border: 1px solid #eee;
          transition: all 0.3s;
        }
        .dashboard-card:hover {
          border-color: #b8860b;
          transform: translateY(-2px);
        }
        .booking-row, .review-row {
          transition: all 0.3s;
        }
        .booking-row:hover, .review-row:hover {
          transform: translateX(5px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: block !important; }
          .btn-gold { padding: 5px 12px !important; font-size: 9px !important; }
          .grid-3 { grid-template-columns: 1fr 1fr !important; }
          .grid-4 { grid-template-columns: 1fr 1fr !important; }
          .lightbox-prev, .lightbox-next { font-size: 30px; padding: 10px; }
          .modal-content { max-width: 95%; }
          .admin-sidebar-fixed {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            z-index: 6300;
          }
          .admin-sidebar-fixed.mobile-open {
            transform: translateX(0);
          }
          .admin-content-fixed {
            left: 0;
            padding: 20px;
          }
          .admin-hamburger-mobile {
            display: flex !important;
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: #b8860b;
            color: #fff;
            border-radius: 50%;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 6400;
            font-size: 24px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border: none;
          }
          .mobile-sidebar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 6200;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .rooms-list > div {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            padding: 15px;
          }
          .gallery-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
        }
        @media (min-width: 769px) {
          .admin-hamburger-mobile {
            display: none !important;
          }
          .mobile-sidebar-overlay {
            display: none !important;
          }
        }
        @media (max-width: 500px) {
          .grid-3 { grid-template-columns: 1fr !important; }
          .grid-4 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className={`mobile-menu-overlay ${mobileMenuOpen ? "open" : ""}`} onClick={() => setMobileMenuOpen(false)} />
      
      <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-close" onClick={() => setMobileMenuOpen(false)}>×</div>
        {["home", "rooms", "gallery", "contact"].map(v => (
          <div key={v} className={`mobile-nav-link ${view === v ? "active" : ""}`} onClick={() => { setView(v); setMobileMenuOpen(false); }}>{v}</div>
        ))}
        <div className="mobile-nav-link" onClick={() => { setAdminOpen(true); setMobileMenuOpen(false); }}>Admin</div>
      </div>

      {lightboxOpen && (
        <div className="lightbox" onClick={closeLightbox}>
          <span className="lightbox-close" onClick={closeLightbox}>×</span>
          <span className="lightbox-prev" onClick={(e) => { e.stopPropagation(); prevImage(); }}>❮</span>
          <img src={currentImage} alt="Gallery" className="lightbox-image" onClick={(e) => e.stopPropagation()} />
          <span className="lightbox-next" onClick={(e) => { e.stopPropagation(); nextImage(); }}>❯</span>
          <div style={{ position: "absolute", bottom: 20, left: 0, right: 0, textAlign: "center", color: "#fff", fontSize: 14 }}>
            {currentImageIndex + 1} / {gallery.length}
          </div>
        </div>
      )}

      {roomDetailModal && selectedRoom && (
        <div className="modal-overlay" onClick={() => setRoomDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="modal-close" onClick={() => setRoomDetailModal(false)}>×</span>
            <div style={{ padding: "20px 25px 30px" }}>
              <img src={selectedRoom.image} alt={selectedRoom.name} style={{ width: "100%", height: 280, objectFit: "cover", borderRadius: 12, marginBottom: 20 }} />
              <h2 style={{ fontSize: 28, marginBottom: 8 }}>{selectedRoom.name}</h2>
              <div style={{ display: "flex", gap: 15, marginBottom: 15, flexWrap: "wrap" }}>
                <span style={{ background: "#b8860b", color: "#fff", padding: "4px 12px", borderRadius: 20, fontSize: 12 }}>{selectedRoom.category.toUpperCase()}</span>
                <span style={{ background: "#f0e8dd", color: "#b8860b", padding: "4px 12px", borderRadius: 20, fontSize: 12 }}>👥 Max {selectedRoom.capacity} Guests</span>
                <span style={{ background: "#f0e8dd", color: "#b8860b", padding: "4px 12px", borderRadius: 20, fontSize: 12 }}>📏 {selectedRoom.size}</span>
              </div>
              <p style={{ fontSize: 14, color: "#555", lineHeight: 1.6, marginBottom: 20 }}>{selectedRoom.description}</p>
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 16, marginBottom: 10 }}>✨ Amenities</h4>
                <div>{selectedRoom.amenities.map((a: string, i: number) => (<span key={i} className="amenity-badge">{a}</span>))}</div>
              </div>
              <div style={{ borderTop: "1px solid #eee", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 15 }}>
                <div><span style={{ fontSize: 12, color: "#888" }}>Price per night</span><div style={{ fontSize: 28, color: "#b8860b", fontWeight: 600 }}>₹{selectedRoom.price.toLocaleString()}</div></div>
                <button className="btn-gold" style={{ padding: "12px 32px" }} onClick={proceedToBook}>Book This Room →</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast-anim" style={{ 
          position: "fixed", 
          bottom: 30, 
          right: 30, 
          zIndex: 9999, 
          background: toast.type === "error" ? "#dc3545" : toast.type === "warning" ? "#ffc107" : "#b8860b", 
          color: toast.type === "warning" ? "#333" : "#fff", 
          padding: "12px 24px", 
          borderRadius: 8, 
          fontSize: 12, 
          fontWeight: 600,
          maxWidth: "350px",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
        }}>
          {toast.msg}
        </div>
      )}

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, background: "rgba(255,255,255,0.98)", backdropFilter: "blur(12px)", borderBottom: "1px solid #eee", padding: "0 40px", height: 70, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div onClick={() => setView("home")} style={{ cursor: "pointer" }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 600, color: "#b8860b" }}>HOTEL MIDWAY</div>
          <div style={{ fontSize: 8, letterSpacing: 3, color: "#999" }}>TOURIST RESORTS</div>
        </div>
        
        <div className="desktop-nav">
          {["home", "rooms", "gallery", "contact"].map(v => (
            <span key={v} className={`nav-link ${view === v ? "active" : ""}`} onClick={() => setView(v)}>{v}</span>
          ))}
          <span className="nav-link" onClick={() => setAdminOpen(true)}>Admin</span>
          <button className="btn-gold" onClick={() => setView("rooms")}>Book Now</button>
        </div>
        
        <div className="hamburger" onClick={() => setMobileMenuOpen(true)}>☰</div>
      </nav>

      <div style={{ paddingTop: 70 }}>
        
        {view === "home" && (
          <>
            <section style={{ 
              minHeight: "85vh", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              position: "relative", 
              backgroundImage: `url('${heroBg}')`, 
              backgroundSize: "cover", 
              backgroundPosition: "center", 
              backgroundRepeat: "no-repeat"
            }}>
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
              <div style={{ position: "relative", textAlign: "center", color: "#fff", padding: "0 20px" }} className="fade-up">
                <div style={{ fontSize: 12, letterSpacing: 6, marginBottom: 20 }}>WELCOME TO</div>
                <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 88, fontWeight: 300 }}>Hotel <span style={{ color: "#b8860b" }}>Midway</span></h1>
                <p style={{ fontSize: 14, letterSpacing: 3, margin: "30px auto", maxWidth: 600 }}>Experience luxury, comfort, and unforgettable moments</p>
                <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                  <button className="btn-gold" onClick={() => setView("rooms")}>View Rooms</button>
                  <button className="btn-outline" style={{ borderColor: "#fff", color: "#fff" }} onClick={() => setView("contact")}>Contact Us</button>
                </div>
              </div>
            </section>

            <section style={{ padding: "80px 40px", background: "#fff" }}>
              <div style={{ textAlign: "center", marginBottom: 48 }}><div style={{ fontSize: 10, letterSpacing: 5, color: "#b8860b" }}>OUR BEST</div><h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 44, fontWeight: 300 }}>Featured Rooms</h2></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 30, maxWidth: 1200, margin: "0 auto" }} className="grid-3">
                {rooms.slice(0, 3).map((room: any) => (
                  <div key={room.id} className="card-hover" style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12 }} onClick={() => openRoomDetail(room)}>
                    <img src={room.image} alt={room.name} style={{ width: "100%", height: 250, objectFit: "cover" }} />
                    <div style={{ padding: 20 }}><h3 style={{ fontSize: 20 }}>{room.name}</h3><p style={{ fontSize: 13, color: "#666", margin: "10px 0" }}>{room.description.substring(0, 60)}...</p><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 22, color: "#b8860b" }}>₹{room.price}</span><button className="btn-gold" style={{ padding: "8px 20px" }} onClick={(e) => { e.stopPropagation(); openRoomDetail(room); }}>View Details</button></div></div>
                  </div>
                ))}
              </div>
            </section>

            <section style={{ padding: "60px 40px", background: "#faf8f5" }}>
              <div style={{ textAlign: "center", marginBottom: 48 }}>
                <div style={{ fontSize: 10, letterSpacing: 5, color: "#b8860b" }}>EXPLORE</div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 44, fontWeight: 300 }}>Nearby Tourist Spots</h2>
                <p style={{ fontSize: 14, color: "#666", marginTop: 12 }}>Discover the beauty around Hotel Midway</p>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 30, maxWidth: 1200, margin: "0 auto" }}>
                {touristSpots.map((spot: any) => (
                  <div key={spot.id} className="card-hover" style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                    <div style={{ position: "relative" }}>
                      <img src={spot.image} alt={spot.name} style={{ width: "100%", height: 220, objectFit: "cover" }} />
                      <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.7)", color: "#ffc107", padding: "4px 10px", borderRadius: 20, fontSize: 12 }}>
                        ★ {spot.rating}
                      </div>
                    </div>
                    <div style={{ padding: 20 }}>
                      <h3 style={{ fontSize: 20, marginBottom: 8 }}>{spot.name}</h3>
                      <p style={{ fontSize: 13, color: "#555", marginBottom: 12, lineHeight: 1.5 }}>{spot.summary}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                        <span>📍</span>
                        <span style={{ fontSize: 12, color: "#b8860b", fontWeight: 500 }}>{spot.distance}</span>
                      </div>
                      <button className="btn-outline" style={{ width: "100%", fontSize: 12 }} onClick={() => window.open(spot.googleMapsLink || `https://www.google.com/maps/search/${encodeURIComponent(spot.name + " Manali")}`, "_blank")}>
                        🗺️ Get Directions
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section style={{ padding: "60px 40px", background: "#faf8f5" }}>
              <div style={{ textAlign: "center", marginBottom: 48 }}>
                <div style={{ fontSize: 10, letterSpacing: 5, color: "#b8860b" }}>PREMIUM FACILITIES</div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 44, fontWeight: 300 }}>Our Services</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 30, maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
                <div><i className="fas fa-utensils" style={{ fontSize: 40, color: "#b8860b", marginBottom: 16 }}></i><h3>Restaurant</h3><p style={{ fontSize: 12, color: "#666" }}>Multi-cuisine dining</p></div>
                <div><i className="fas fa-wifi" style={{ fontSize: 40, color: "#b8860b", marginBottom: 16 }}></i><h3>Free WiFi</h3><p style={{ fontSize: 12, color: "#666" }}>High-speed internet</p></div>
                <div><i className="fas fa-tshirt" style={{ fontSize: 40, color: "#b8860b", marginBottom: 16 }}></i><h3>Laundry Service</h3><p style={{ fontSize: 12, color: "#666" }}>Fresh & clean</p></div>
                <div><i className="fas fa-concierge-bell" style={{ fontSize: 40, color: "#b8860b", marginBottom: 16 }}></i><h3>Room Service</h3><p style={{ fontSize: 12, color: "#666" }}>24/7 availability</p></div>
              </div>
            </section>

            <section style={{ padding: "60px 40px", background: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap" }}>
                <div><div style={{ fontSize: 10, letterSpacing: 5, color: "#b8860b" }}>GUEST REVIEWS</div><h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 300 }}>What Our Guests Say</h2><div style={{ marginTop: 8 }}><span className="star">{"★".repeat(Math.round(+avgRating))}{"☆".repeat(5 - Math.round(+avgRating))}</span><span style={{ marginLeft: 8, color: "#666" }}>({avgRating} / 5)</span></div></div>
                <button className="btn-outline" onClick={() => setReviewModal(true)}>Write a Review</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 24, maxWidth: 1000, margin: "0 auto" }}>
                {reviews.slice(0, 4).map((r: any) => (<div key={r.id} style={{ background: "#faf8f5", padding: 20, borderRadius: 12 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><strong>{r.name}</strong><div className="star" style={{ fontSize: 12 }}>{"★".repeat(r.rating)}</div></div><p style={{ fontSize: 13, color: "#555" }}>"{r.comment}"</p><div style={{ fontSize: 10, color: "#999", marginTop: 8 }}>{r.date}</div></div>))}
              </div>
            </section>
          </>
        )}

        {view === "rooms" && (
          <section style={{ padding: "80px 40px", background: "#fff" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}><div style={{ fontSize: 10, letterSpacing: 5, color: "#b8860b" }}>OUR COLLECTION</div><h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 300 }}>Choose Your Stay</h2></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 30, maxWidth: 1200, margin: "0 auto" }} className="grid-3">
              {filteredRooms.map((room: any) => (
                <div key={room.id} className="card-hover" style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12 }} onClick={() => openRoomDetail(room)}>
                  <img src={room.image} alt={room.name} style={{ width: "100%", height: 250, objectFit: "cover" }} />
                  <div style={{ padding: 20 }}>
                    <h3>{room.name}</h3>
                    <p style={{ fontSize: 13, color: "#666", margin: "10px 0" }}>{room.description.substring(0, 60)}...</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 22, color: "#b8860b" }}>₹{room.price}</span>
                      <button className="btn-gold" style={{ padding: "8px 20px" }} onClick={(e) => { e.stopPropagation(); openRoomDetail(room); }}>View Details</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {view === "gallery" && (
          <section style={{ padding: "80px 40px" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}><div style={{ fontSize: 10, letterSpacing: 5, color: "#b8860b" }}>MOMENTS</div><h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 300 }}>Photo Gallery</h2></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, maxWidth: 1200, margin: "0 auto" }} className="grid-3">
              {gallery.map((img: string, i: number) => (
                <div key={i} className="card-hover" style={{ borderRadius: 12, overflow: "hidden", aspectRatio: "4/3", cursor: "pointer" }} onClick={() => openLightbox(i)}>
                  <img src={img} alt={`Gallery ${i+1}`} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }} onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"} onMouseOut={e => e.currentTarget.style.transform = "scale(1)"} />
                </div>
              ))}
            </div>
          </section>
        )}

        {view === "contact" && (
          <section style={{ padding: "80px 40px", maxWidth: 1000, margin: "0 auto" }}>
            <div style={{ fontSize: 10, letterSpacing: 5, color: "#b8860b" }}>GET IN TOUCH</div><h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 52, fontWeight: 300, marginBottom: 48 }}>Contact <em>Us</em></h2><div style={{ height: 1, background: "#eee", marginBottom: 40 }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
              <div>
                <div style={{ marginBottom: 28 }}><div style={{ fontSize: 9, letterSpacing: 3, color: "#b8860b", marginBottom: 6 }}>📞 PHONE NUMBERS</div>{contacts?.phones?.map((phone: string, idx: number) => (<div key={idx} style={{ fontSize: 16, color: "#333", marginBottom: 8 }}>{phone}</div>))}</div>
                <div style={{ marginBottom: 28 }}><div style={{ fontSize: 9, letterSpacing: 3, color: "#b8860b", marginBottom: 6 }}>📧 EMAIL ADDRESSES</div>{contacts?.emails?.map((email: string, idx: number) => (<div key={idx} style={{ fontSize: 16, color: "#333", marginBottom: 8 }}>{email}</div>))}</div>
                <div style={{ marginBottom: 28 }}><div style={{ fontSize: 9, letterSpacing: 3, color: "#b8860b", marginBottom: 6 }}>📍 ADDRESS</div><div style={{ fontSize: 16, color: "#333" }}>{hotelInfo.address}</div></div>
                <div style={{ marginBottom: 28 }}><div style={{ fontSize: 9, letterSpacing: 3, color: "#b8860b", marginBottom: 6 }}>⏰ CHECK-IN / CHECK-OUT</div><div style={{ fontSize: 16, color: "#333" }}>Check-in: {hotelInfo.checkIn} | Check-out: {hotelInfo.checkOut}</div></div>
              </div>
              <div><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d54471.59274236619!2d76.73903092657216!3d31.428600228030827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3905166dad6fea4f%3A0x62f9d58473e2fcb3!2sMid%20Way%20Tourist%20Resort!5e0!3m2!1sen!2sin!4v1780934124836!5m2!1sen!2sin" width="100%" height="280" style={{ border: 0, borderRadius: 12 }} allowFullScreen loading="lazy" title="Map" /></div>
            </div>
          </section>
        )}

        <footer style={{ background: "#1a1a1a", color: "#fff", padding: "60px 40px 40px", marginTop: 60 }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 40, marginBottom: 48 }}>
            <div><div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: "#b8860b" }}>HOTEL MIDWAY</div><div style={{ fontSize: 10, letterSpacing: 3, color: "#888" }}>TOURIST RESORTS</div><div style={{ fontSize: 12, color: "#777", marginTop: 16 }}>{hotelInfo.address}</div></div>
            <div><div style={{ fontSize: 9, letterSpacing: 3, color: "#b8860b", marginBottom: 16 }}>QUICK LINKS</div>{["home", "rooms", "gallery", "contact"].map(v => (<div key={v} style={{ display: "block", marginBottom: 10, color: "#888", fontSize: 12, cursor: "pointer" }} onClick={() => setView(v)}>{v}</div>))}</div>
            <div><div style={{ fontSize: 9, letterSpacing: 3, color: "#b8860b", marginBottom: 16 }}>CONTACT</div>{contacts?.phones?.slice(0,2)?.map((phone: string, idx: number) => (<div key={idx} style={{ fontSize: 12, color: "#888", lineHeight: 1.8 }}>{phone}</div>))}{contacts?.emails?.slice(0,1)?.map((email: string, idx: number) => (<div key={idx} style={{ fontSize: 12, color: "#888", lineHeight: 1.8 }}>{email}</div>))}</div>
          </div>
          <div style={{ height: 1, background: "#333", margin: "20px 0" }} /><div style={{ textAlign: "center", fontSize: 10, color: "#666", letterSpacing: 2 }}>© 2024 HOTEL MIDWAY. ALL RIGHTS RESERVED.</div>
        </footer>
      </div>

      {/* PAYMENT INFO POPUP - FIXED AMOUNT ₹2000 */}
      {showPaymentPopup && (
        <div className="modal-overlay" onClick={() => setShowPaymentPopup(false)} style={{ zIndex: 10001 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <span className="modal-close" onClick={() => setShowPaymentPopup(false)}>×</span>
            <div style={{ padding: "25px", textAlign: "center" }}>
              <div style={{ 
                width: 70, 
                height: 70, 
                background: "#fff3e0", 
                borderRadius: "50%", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                margin: "0 auto 20px"
              }}>
                <i className="fas fa-phone-alt" style={{ fontSize: 32, color: "#b8860b" }}></i>
              </div>
              
              <h3 style={{ fontSize: 22, marginBottom: 10, color: "#1a1a1a" }}>📞 Confirm Your Booking</h3>
              
              <div style={{ 
                background: "#f0e8dd", 
                padding: "12px 16px", 
                borderRadius: 10,
                marginBottom: 20,
                textAlign: "left"
              }}>
                <div style={{ fontSize: 13, color: "#666", marginBottom: 5 }}>📌 Call us on:</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#b8860b", letterSpacing: 1 }}>
                  +91 98165 86311
                </div>
              </div>
              
              <div style={{ 
                background: "#e8f4e8", 
                padding: "12px 16px", 
                borderRadius: 10,
                marginBottom: 20,
                textAlign: "center"
              }}>
                <div style={{ fontSize: 13, color: "#666", marginBottom: 5 }}>💰 Advance Payment Required</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#2e7d32" }}>
                  ₹2,000 required to confirm booking
                </div>
              </div>
              
              <p style={{ fontSize: 12, color: "#888", marginBottom: 20, lineHeight: 1.5 }}>
                Please call the number above to confirm availability and make advance payment. 
                Your booking will be confirmed only after payment.
              </p>
              
              <button 
                className="btn-gold" 
                style={{ width: "100%", padding: "12px" }}
                onClick={confirmBookingWithPayment}
              >
                I have made the payment
              </button>
              
              <button 
                style={{ 
                  width: "100%", 
                  padding: "10px", 
                  marginTop: 10,
                  background: "transparent",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 12,
                  color: "#666"
                }}
                onClick={() => setShowPaymentPopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING MODAL */}
      {bookingModal && selectedRoom && (
        <div className="modal-overlay" onClick={() => setBookingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <span className="modal-close" onClick={() => setBookingModal(false)}>×</span>
            <div style={{ padding: "25px" }}>
              <h2 style={{ fontSize: 24, marginBottom: 5 }}>Book {selectedRoom.name}</h2>
              <p style={{ fontSize: 12, color: "#888", marginBottom: 20 }}>Max capacity: {selectedRoom.capacity} guests</p>
              
              <input 
                className="input-field" 
                placeholder="Full Name *" 
                value={bookingDetails.name} 
                onChange={e => setBookingDetails({...bookingDetails, name: e.target.value})} 
                style={{ marginBottom: 12 }} 
              />
              
              <div style={{ marginBottom: 12 }}>
                <input 
                  className="input-field" 
                  placeholder="Phone Number * (10 digits)" 
                  type="tel"
                  value={bookingDetails.phone} 
                  onChange={e => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                    setBookingDetails({...bookingDetails, phone: value})
                  }} 
                  style={{ marginBottom: 5 }}
                />
                {bookingDetails.phone && bookingDetails.phone.length > 0 && bookingDetails.phone.length < 10 && (
                  <div style={{ fontSize: 11, color: "#dc3545" }}>❌ Enter valid 10-digit phone number</div>
                )}
                {bookingDetails.phone && bookingDetails.phone.length === 10 && (
                  <div style={{ fontSize: 11, color: "#28a745" }}>✅ Valid phone number</div>
                )}
              </div>
              
              <div style={{ marginBottom: 12 }}>
                <input 
                  className="input-field" 
                  placeholder="Email * (e.g., name@example.com)" 
                  type="email"
                  value={bookingDetails.email} 
                  onChange={e => setBookingDetails({...bookingDetails, email: e.target.value})} 
                  style={{ marginBottom: 5 }}
                />
                {bookingDetails.email && !bookingDetails.email.includes('@') && (
                  <div style={{ fontSize: 11, color: "#dc3545" }}>❌ Enter valid email address</div>
                )}
                {bookingDetails.email && bookingDetails.email.includes('@') && (
                  <div style={{ fontSize: 11, color: "#28a745" }}>✅ Valid email</div>
                )}
              </div>
              
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: "#666", marginBottom: 5, display: "block" }}>📅 Check-in Date *</label>
                <input 
                  className="input-field" 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingDetails.checkIn} 
                  onChange={e => {
                    const checkInDate = e.target.value;
                    setBookingDetails({...bookingDetails, checkIn: checkInDate, checkOut: ""})
                  }} 
                />
                {bookingDetails.checkIn && new Date(bookingDetails.checkIn) < new Date() && (
                  <div style={{ fontSize: 11, color: "#dc3545" }}>❌ Cannot select past date</div>
                )}
              </div>
              
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: "#666", marginBottom: 5, display: "block" }}>📅 Check-out Date *</label>
                <input 
                  className="input-field" 
                  type="date" 
                  min={bookingDetails.checkIn || new Date().toISOString().split('T')[0]}
                  value={bookingDetails.checkOut} 
                  onChange={e => setBookingDetails({...bookingDetails, checkOut: e.target.value})} 
                  disabled={!bookingDetails.checkIn}
                  style={{ opacity: !bookingDetails.checkIn ? 0.6 : 1 }}
                />
                {bookingDetails.checkIn && bookingDetails.checkOut && new Date(bookingDetails.checkOut) <= new Date(bookingDetails.checkIn) && (
                  <div style={{ fontSize: 11, color: "#dc3545" }}>❌ Check-out must be after check-in date</div>
                )}
                {bookingDetails.checkIn && bookingDetails.checkOut && new Date(bookingDetails.checkOut) > new Date(bookingDetails.checkIn) && (
                  <div style={{ fontSize: 11, color: "#28a745" }}>✅ Valid date range</div>
                )}
              </div>
              
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, color: "#666", marginBottom: 5, display: "block" }}>👥 Number of Guests *</label>
                <input 
                  className="input-field" 
                  type="number" 
                  min="1" 
                  max={selectedRoom.capacity}
                  value={bookingDetails.guests} 
                  onChange={e => setBookingDetails({...bookingDetails, guests: Math.min(selectedRoom.capacity, Math.max(1, parseInt(e.target.value) || 1))})} 
                />
                
                <div style={{ 
                  fontSize: 11, 
                  color: "#888", 
                  marginTop: 6,
                  padding: "6px 10px",
                  background: "#f0e8dd",
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}>
                  <span>ℹ️</span>
                  <span>Extra Guests more than the room's Max capacity (mentioned above) will be charged: ₹{selectedRoom.extraPersonCharge || 300} per person per night (Payable at check-in)</span>
                </div>
              </div>
              
              {bookingDetails.checkIn && bookingDetails.checkOut && new Date(bookingDetails.checkOut) > new Date(bookingDetails.checkIn) && (
                <div style={{ background: "#f0e8dd", padding: 12, borderRadius: 8, marginBottom: 20 }}>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 5 }}>💰 Booking Summary</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span>Room Rate:</span>
                    <span>₹{selectedRoom.price}/night</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span>Nights:</span>
                    <span>{Math.ceil((new Date(bookingDetails.checkOut).getTime() - new Date(bookingDetails.checkIn).getTime()) / (1000*60*60*24))}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 600, marginTop: 8, paddingTop: 8, borderTop: "2px solid #d4c5b0" }}>
                    <span>Total Amount:</span>
                    <span style={{ color: "#b8860b" }}>
                      ₹{selectedRoom.price * Math.ceil((new Date(bookingDetails.checkOut).getTime() - new Date(bookingDetails.checkIn).getTime()) / (1000*60*60*24))}
                    </span>
                  </div>
                </div>
              )}
              
              <button 
                className="btn-gold" 
                style={{ 
                  width: "100%", 
                  padding: "14px",
                  opacity: (
                    !bookingDetails.name ||
                    !bookingDetails.phone || 
                    bookingDetails.phone.length !== 10 ||
                    !bookingDetails.email || 
                    !bookingDetails.email.includes('@') ||
                    !bookingDetails.checkIn ||
                    !bookingDetails.checkOut ||
                    new Date(bookingDetails.checkIn) < new Date() ||
                    new Date(bookingDetails.checkOut) <= new Date(bookingDetails.checkIn)
                  ) ? 0.5 : 1
                }}
                onClick={showBookingConfirmationPopup}
                disabled={
                  !bookingDetails.name ||
                  !bookingDetails.phone || 
                  bookingDetails.phone.length !== 10 ||
                  !bookingDetails.email || 
                  !bookingDetails.email.includes('@') ||
                  !bookingDetails.checkIn ||
                  !bookingDetails.checkOut ||
                  new Date(bookingDetails.checkIn) < new Date() ||
                  new Date(bookingDetails.checkOut) <= new Date(bookingDetails.checkIn)
                }
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW MODAL - WITH PHONE NUMBER MANDATORY */}
      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <span className="modal-close" onClick={() => setReviewModal(false)}>×</span>
            <div style={{ padding: "25px" }}>
              <h2 style={{ fontSize: 24, marginBottom: 20 }}>Write a Review</h2>
              
              <input 
                className="input-field" 
                placeholder="Full Name *" 
                value={newReview.name} 
                onChange={e => setNewReview({...newReview, name: e.target.value})} 
                style={{ marginBottom: 12 }} 
              />
              
              <div style={{ marginBottom: 12 }}>
                <input 
                  className="input-field" 
                  placeholder="Phone Number * (10 digits)" 
                  type="tel"
                  value={newReview.phone} 
                  onChange={e => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                    setNewReview({...newReview, phone: value})
                  }} 
                  style={{ marginBottom: 5 }}
                />
                {newReview.phone && newReview.phone.length > 0 && newReview.phone.length < 10 && (
                  <div style={{ fontSize: 11, color: "#dc3545" }}>❌ Enter valid 10-digit phone number</div>
                )}
                {newReview.phone && newReview.phone.length === 10 && (
                  <div style={{ fontSize: 11, color: "#28a745" }}>✅ Valid phone number</div>
                )}
              </div>
              
              <div style={{ marginBottom: 12 }}>
                <input 
                  className="input-field" 
                  placeholder="Email * (e.g., name@example.com)" 
                  type="email"
                  value={newReview.email} 
                  onChange={e => setNewReview({...newReview, email: e.target.value})} 
                  style={{ marginBottom: 5 }}
                />
                {newReview.email && !newReview.email.includes('@') && (
                  <div style={{ fontSize: 11, color: "#dc3545" }}>❌ Enter valid email address</div>
                )}
                {newReview.email && newReview.email.includes('@') && (
                  <div style={{ fontSize: 11, color: "#28a745" }}>✅ Valid email</div>
                )}
              </div>
              
              <select className="input-field" value={newReview.rating} onChange={e => setNewReview({...newReview, rating: +e.target.value})} style={{ marginBottom: 12 }}>
                <option value="5">5 Stars - Excellent</option>
                <option value="4">4 Stars - Very Good</option>
                <option value="3">3 Stars - Good</option>
                <option value="2">2 Stars - Fair</option>
                <option value="1">1 Star - Poor</option>
              </select>
              
              <textarea 
                className="input-field" 
                placeholder="Your Comment *" 
                rows={4} 
                value={newReview.comment} 
                onChange={e => setNewReview({...newReview, comment: e.target.value})} 
                style={{ marginBottom: 20 }} 
              />
              
              <button 
                className="btn-gold" 
                style={{ 
                  width: "100%",
                  opacity: (
                    !newReview.name ||
                    !newReview.phone || 
                    newReview.phone.length !== 10 ||
                    !newReview.email || 
                    !newReview.email.includes('@') ||
                    !newReview.comment
                  ) ? 0.5 : 1
                }}
                onClick={submitReview}
                disabled={
                  !newReview.name ||
                  !newReview.phone || 
                  newReview.phone.length !== 10 ||
                  !newReview.email || 
                  !newReview.email.includes('@') ||
                  !newReview.comment
                }
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {adminOpen && (
        <div className="admin-panel-container">
          {sidebarOpen && <div className="mobile-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
          <button className="admin-hamburger-mobile" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          
          {!adminAuth ? (
            <div className="admin-login-box">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2>Admin Login</h2>
                <span onClick={() => { setAdminOpen(false); setSidebarOpen(false); }} style={{ cursor: "pointer", fontSize: 28, color: "#999" }}>×</span>
              </div>
              <input className="input-field" type="password" placeholder="Password" value={adminPass} onChange={e => setAdminPass(e.target.value)} style={{ marginBottom: 20 }} />
              <button className="btn-gold" style={{ width: "100%" }} onClick={() => { if(adminPass === ADMIN_PASSWORD) { setAdminAuth(true); setAdminPass(""); } else showToast("Wrong password", "error"); }}>Login</button>
            </div>
          ) : (
            <>
              <div className={`admin-sidebar-fixed ${sidebarOpen ? "mobile-open" : ""}`}>
                <div style={{ padding: "20px", borderBottom: "1px solid #333", marginBottom: 10 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: "#b8860b" }}>HOTEL MIDWAY</div>
                  <div style={{ fontSize: 9, color: "#555" }}>ADMIN PANEL</div>
                </div>
                {adminMenuItems.map(item => (
                  <div key={item.id} className={`admin-nav-item ${adminTab === item.id ? "active" : ""}`} onClick={() => { setAdminTab(item.id); setEditRoom(null); setEditSpot(null); setSidebarOpen(false); }}>
                    <span>{item.label}</span>
                  </div>
                ))}
                <div style={{ padding: "20px", borderTop: "1px solid #333", marginTop: 20 }}>
                  <button className="btn-outline" style={{ width: "100%" }} onClick={() => { setAdminOpen(false); setAdminAuth(false); setSidebarOpen(false); }}>Logout</button>
                </div>
              </div>

              <div className="admin-content-fixed">
                {adminTab === "dashboard" && (
                  <>
                    <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginBottom: 30 }}>
                      <div className="dashboard-card"><div>Total Revenue</div><h3 style={{ fontSize: 28, color: "#b8860b" }}>₹{totalRevenue.toLocaleString()}</h3></div>
                      <div className="dashboard-card"><div>Total Bookings</div><h3 style={{ fontSize: 28, color: "#b8860b" }}>{bookings.length}</h3></div>
                      <div className="dashboard-card"><div>Active Rooms</div><h3 style={{ fontSize: 28, color: "#b8860b" }}>{rooms.length}</h3></div>
                    </div>
                    <div className="dashboard-card"><h4>Recent Bookings</h4>{bookings.slice(0,5).map((b: any) => <div key={b.id} style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}><strong>{b.customer.name}</strong> - {b.room.name} - {b.nights} nights - ₹{b.totalPrice}<br /><span style={{ fontSize: 11, color: "#888" }}>{b.customer.checkIn} to {b.customer.checkOut} | Guests: {b.customer.guests}</span><span style={{ marginLeft: 10, background: getStatusColor(b.status), color: "#fff", padding: "2px 8px", borderRadius: 12, fontSize: 10 }}>{b.status}</span></div>)}</div>
                  </>
                )}

                {adminTab === "rooms" && (
                  <div className="rooms-list">
                   {rooms.map((r: any) => <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, borderBottom: "1px solid #eee", flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <img src={r.image} style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 8 }} />
                        <div><strong>{r.name}</strong><div>₹{r.price}/night | Max {r.capacity} guests | {r.baseOccupancy} included | Extra: ₹{r.extraPersonCharge}</div></div>
                      </div>
                      <div>
                        <button className="btn-outline" style={{ marginRight: 8 }} onClick={() => startEdit(r)}>Edit</button>
                        <button className="btn-outline" style={{ background: "#dc3545", color: "#fff" }} onClick={() => deleteRoom(r.id)}>Delete</button>
                      </div>
                    </div>)}
                  </div>
                )}

                {adminTab === "add" && (
                  <div style={{ maxWidth: 600 }}>
                    <h3>{editRoom ? "Edit Room" : "Add New Room"}</h3>
                    <input className="input-field" placeholder="Room Name" value={newRoom.name} onChange={e => setNewRoom({...newRoom, name: e.target.value})} style={{ marginBottom: 12 }} />
                    <select className="input-field" value={newRoom.category} onChange={e => setNewRoom({...newRoom, category: e.target.value})} style={{ marginBottom: 12 }}>
                      <option value="standard">Standard</option><option value="deluxe">Deluxe</option><option value="suite">Suite</option><option value="premium">Premium</option>
                    </select>
                    <input className="input-field" type="number" placeholder="Price (₹)" value={newRoom.price} onChange={e => setNewRoom({...newRoom, price: e.target.value})} style={{ marginBottom: 12 }} />
                    <input className="input-field" type="number" placeholder="Max Capacity (guests)" value={newRoom.capacity} onChange={e => setNewRoom({...newRoom, capacity: e.target.value})} style={{ marginBottom: 12 }} />
                    <input className="input-field" type="number" placeholder="Base Occupancy (guests included in price)" value={newRoom.baseOccupancy} onChange={e => setNewRoom({...newRoom, baseOccupancy: e.target.value})} style={{ marginBottom: 12 }} />
                    <input className="input-field" type="number" placeholder="Extra Person Charge (₹ per night)" value={newRoom.extraPersonCharge} onChange={e => setNewRoom({...newRoom, extraPersonCharge: e.target.value})} style={{ marginBottom: 12 }} />
                    <textarea className="input-field" placeholder="Description" rows={3} value={newRoom.description} onChange={e => setNewRoom({...newRoom, description: e.target.value})} style={{ marginBottom: 12 }} />
                    <input className="input-field" placeholder="Amenities (comma separated)" value={newRoom.amenities} onChange={e => setNewRoom({...newRoom, amenities: e.target.value})} style={{ marginBottom: 12 }} />
                    <input className="input-field" placeholder="Size (e.g., 320 sq ft)" value={newRoom.size} onChange={e => setNewRoom({...newRoom, size: e.target.value})} style={{ marginBottom: 12 }} />
                    <div><button className="btn-outline" onClick={() => roomImageRef.current?.click()} disabled={uploading}>📷 {uploading ? "Processing..." : "Upload Room Image"}</button><input ref={roomImageRef} type="file" accept="image/*" onChange={uploadRoomImage} style={{ display: "none" }} /></div>
                    {newRoom.image && <img src={newRoom.image} style={{ width: 100, marginTop: 12, borderRadius: 8 }} alt="preview" />}
                    <button className="btn-gold" style={{ marginTop: 20 }} onClick={saveRoom}>{editRoom ? "Update" : "Add"} Room</button>
                  </div>
                )}

                {adminTab === "touristSpots" && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                      <h3 style={{ fontSize: 24 }}>🏞️ Manage Tourist Spots</h3>
                      <button className="btn-gold" onClick={() => {
                        setEditSpot(null);
                        setNewSpot({ name: "", summary: "", distance: "", image: "", rating: 5, googleMapsLink: "" });
                        setAdminTab("addSpot");
                      }}>➕ Add New Spot</button>
                    </div>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 20 }}>
                      {touristSpots.map((spot: any) => (
                        <div key={spot.id} style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: "1px solid #eee" }}>
                          <img src={spot.image} alt={spot.name} style={{ width: "100%", height: 180, objectFit: "cover" }} />
                          <div style={{ padding: 15 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                              <h4 style={{ fontSize: 18 }}>{spot.name}</h4>
                              <div className="star">{"★".repeat(Math.floor(spot.rating))}{spot.rating % 1 ? "½" : ""}</div>
                            </div>
                            <p style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>{spot.summary}</p>
                            <p style={{ fontSize: 12, color: "#b8860b", marginBottom: 8 }}>📍 {spot.distance}</p>
                            {spot.googleMapsLink && (
                              <a href={spot.googleMapsLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#b8860b", textDecoration: "none", display: "inline-block", marginBottom: 12 }}>
                                🗺️ View on Google Maps
                              </a>
                            )}
                            <div style={{ display: "flex", gap: 10 }}>
                              <button className="btn-outline" style={{ fontSize: 11, padding: "6px 12px" }} onClick={() => {
                                setEditSpot(spot);
                                setNewSpot(spot);
                                setAdminTab("addSpot");
                              }}>Edit</button>
                              <button className="btn-outline" style={{ fontSize: 11, padding: "6px 12px", background: "#dc3545", color: "#fff" }} onClick={() => {
                                if (confirm("Delete this spot?")) {
                                  setTouristSpots(prev => prev.filter((s: any) => s.id !== spot.id));
                                  showToast("Spot deleted!");
                                }
                              }}>Delete</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminTab === "addSpot" && (
                  <div style={{ maxWidth: 600 }}>
                    <h3>{editSpot ? "Edit Tourist Spot" : "Add New Tourist Spot"}</h3>
                    <input className="input-field" placeholder="Spot Name" value={newSpot.name} onChange={e => setNewSpot({...newSpot, name: e.target.value})} style={{ marginBottom: 12 }} />
                    <textarea className="input-field" placeholder="Summary / Description" rows={3} value={newSpot.summary} onChange={e => setNewSpot({...newSpot, summary: e.target.value})} style={{ marginBottom: 12 }} />
                    <input className="input-field" placeholder="Distance (e.g., 2 km away from our hotel)" value={newSpot.distance} onChange={e => setNewSpot({...newSpot, distance: e.target.value})} style={{ marginBottom: 12 }} />
                    <input className="input-field" type="number" step="0.1" min="0" max="5" placeholder="Rating (0-5)" value={newSpot.rating} onChange={e => setNewSpot({...newSpot, rating: parseFloat(e.target.value)})} style={{ marginBottom: 12 }} />
                    <input className="input-field" placeholder="Google Maps Link (e.g., https://maps.google.com/?q=Place+Name)" value={newSpot.googleMapsLink} onChange={e => setNewSpot({...newSpot, googleMapsLink: e.target.value})} style={{ marginBottom: 12 }} />
                    <div><button className="btn-outline" onClick={() => spotImageRef.current?.click()} disabled={uploading}>📷 {uploading ? "Processing..." : "Upload Spot Image"}</button><input ref={spotImageRef} type="file" accept="image/*" onChange={uploadSpotImage} style={{ display: "none" }} /></div>
                    {newSpot.image && <img src={newSpot.image} style={{ width: 100, marginTop: 12, borderRadius: 8 }} alt="preview" />}
                    <button className="btn-gold" style={{ marginTop: 20 }} onClick={saveSpot}>{editSpot ? "Update" : "Add"} Spot</button>
                  </div>
                )}

                {adminTab === "bookings" && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 15 }}>
                      <h3 style={{ fontSize: 24 }}>📋 Booking Management</h3>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <select className="input-field" style={{ width: "auto", padding: "8px 16px" }} value={bookingFilter} onChange={(e) => setBookingFilter(e.target.value)}>
                          <option value="all">All Bookings ({bookings.length})</option>
                          <option value="Confirmed">✅ Confirmed ({bookings.filter((b: any) => b.status === "Confirmed").length})</option>
                          <option value="Pending">⏳ Pending ({bookings.filter((b: any) => b.status === "Pending").length})</option>
                          <option value="Cancelled">❌ Cancelled ({bookings.filter((b: any) => b.status === "Cancelled").length})</option>
                        </select>
                        <input className="input-field" placeholder="🔍 Search by name or phone..." style={{ width: "220px" }} value={bookingSearch} onChange={(e) => setBookingSearch(e.target.value)} />
                      </div>
                    </div>

                    {getFilteredBookings().length === 0 ? (
                      <div className="dashboard-card" style={{ textAlign: "center", padding: "60px" }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                        <h4>No Bookings Found</h4>
                      </div>
                    ) : (
                      getFilteredBookings().map((b: any) => (
                        <div key={b.id} className="booking-row" style={{ background: "#fff", padding: 20, marginBottom: 16, borderRadius: 12, borderLeft: `4px solid ${getStatusColor(b.status)}`, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 15 }}>
                            <div style={{ flex: 2 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
                                <strong style={{ fontSize: 18 }}>{b.customer.name}</strong>
                                <span style={{ background: getStatusColor(b.status), color: "#fff", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{b.status}</span>
                                <span style={{ fontSize: 11, color: "#888" }}>ID: #{b.id}</span>
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 12 }}>
                                <div><div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>📞 Phone</div><div>{b.customer.phone}</div></div>
                                <div><div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>✉️ Email</div><div>{b.customer.email || "Not provided"}</div></div>
                                <div><div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>🛏️ Room</div><div><strong>{b.room.name}</strong> (₹{b.room.price}/night)</div></div>
                                <div><div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>👥 Guests</div><div>{b.customer.guests} / {b.room.capacity} max</div></div>
                              </div>
                              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 12 }}>
                                <div><div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>📅 Check In</div><div><strong>{b.customer.checkIn}</strong></div></div>
                                <div><div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>📅 Check Out</div><div><strong>{b.customer.checkOut}</strong></div></div>
                                <div><div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>🌙 Nights</div><div><strong>{b.nights} nights</strong></div></div>
                                <div><div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>💰 Total</div><div style={{ fontSize: 20, color: "#b8860b", fontWeight: 600 }}>₹{b.totalPrice.toLocaleString()}</div></div>
                              </div>
                              <div style={{ fontSize: 11, color: "#999" }}>Booked on: {b.date}</div>
                            </div>
                            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                              {b.status !== "Confirmed" && <button className="btn-gold" style={{ padding: "8px 16px", fontSize: 11 }} onClick={() => updateBookingStatus(b.id, "Confirmed")}>✅ Confirm</button>}
                              {b.status !== "Pending" && <button style={{ padding: "8px 16px", fontSize: 11, background: "#ffc107", color: "#000", border: "none", borderRadius: 4, cursor: "pointer" }} onClick={() => updateBookingStatus(b.id, "Pending")}>⏳ Pending</button>}
                              {b.status !== "Cancelled" && <button style={{ padding: "8px 16px", fontSize: 11, background: "#dc3545", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }} onClick={() => updateBookingStatus(b.id, "Cancelled")}>❌ Cancel</button>}
                              <button style={{ padding: "8px 16px", fontSize: 11, background: "#6c757d", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }} onClick={() => deleteBooking(b.id)}>🗑️ Delete</button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {adminTab === "reviews" && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 15 }}>
                      <h3 style={{ fontSize: 24 }}>⭐ Manage Guest Reviews</h3>
                      <div style={{ display: "flex", gap: 10 }}>
                        <input className="input-field" placeholder="🔍 Search by name, email or phone..." style={{ width: "220px" }} onChange={(e) => {
                          const search = e.target.value.toLowerCase();
                          const rows = document.querySelectorAll('.review-row');
                          rows.forEach((row: any) => {
                            const text = row.innerText.toLowerCase();
                            if (text.includes(search)) { row.style.display = "block"; } else { row.style.display = "none"; }
                          });
                        }} />
                      </div>
                    </div>
                    {reviews.length === 0 ? (
                      <div className="dashboard-card" style={{ textAlign: "center", padding: "60px" }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>⭐</div>
                        <h4>No Reviews Yet</h4>
                      </div>
                    ) : (
                      reviews.map((r: any) => (
                        <div key={r.id} className="review-row" style={{ background: "#fff", padding: 20, marginBottom: 16, borderRadius: 12, borderLeft: `4px solid ${r.rating >= 4 ? "#28a745" : r.rating >= 3 ? "#ffc107" : "#dc3545"}` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 15 }}>
                            <div>
                              <strong>{r.name}</strong> 
                              <span style={{ fontSize: 12, color: "#888", marginLeft: 8 }}>📞 {r.phone || "N/A"}</span>
                              <div style={{ fontSize: 12, color: "#888" }}>✉️ {r.email}</div>
                              <div className="star">{"★".repeat(r.rating)}</div>
                              <p style={{ marginTop: 8 }}>"{r.comment}"</p>
                              <span style={{ fontSize: 11, color: "#999" }}>{r.date}</span>
                            </div>
                            <button style={{ padding: "8px 16px", fontSize: 11, background: "#dc3545", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }} onClick={() => deleteReview(r.id)}>🗑️ Delete</button>
                          </div>
                        </div>
                       ))
                    )}
                  </div>
                )}

                {adminTab === "gallery" && (
                  <>
                    <div style={{ background: "#f5f5f5", padding: 20, borderRadius: 12, marginBottom: 24 }}>
                      <h4>Add New Gallery Image</h4>
                      <button className="btn-outline" onClick={() => galleryImageRef.current?.click()} disabled={uploading}>📷 {uploading ? "Processing..." : "Upload from Gallery"}</button>
                      <input ref={galleryImageRef} type="file" accept="image/*" onChange={uploadGalleryImage} style={{ display: "none" }} />
                    </div>
                    <div className="gallery-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 15 }}>
                      {gallery.map((img: string, i: number) => <div key={i} style={{ position: "relative" }}>
                        <img src={img} style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 8 }} />
                        <button className="btn-outline" style={{ position: "absolute", top: 5, right: 5, padding: "4px 8px", background: "#dc3545", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }} onClick={() => deleteGalleryImage(i)}>×</button>
                      </div>)}
                    </div>
                  </>
                )}

                {adminTab === "info" && (
                  <div style={{ maxWidth: 600 }}>
                    <h3 style={{ marginBottom: 20, fontSize: 24 }}>🏨 Hotel Information</h3>
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ fontSize: 12, color: "#666", marginBottom: 5, display: "block" }}>📍 Full Address</label>
                      <textarea className="input-field" rows={3} value={editInfo.address} onChange={e => setEditInfo({...editInfo, address: e.target.value})} style={{ marginBottom: 5, resize: "vertical" }} />
                    </div>
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ fontSize: 12, color: "#666", marginBottom: 5, display: "block" }}>⏰ Check-in Time</label>
                      <input className="input-field" value={editInfo.checkIn} onChange={e => setEditInfo({...editInfo, checkIn: e.target.value})} />
                    </div>
                    <div style={{ marginBottom: 25 }}>
                      <label style={{ fontSize: 12, color: "#666", marginBottom: 5, display: "block" }}>⏰ Check-out Time</label>
                      <input className="input-field" value={editInfo.checkOut} onChange={e => setEditInfo({...editInfo, checkOut: e.target.value})} />
                    </div>
                    <button className="btn-gold" onClick={saveInfo}>💾 Save Changes</button>
                  </div>
                )}

                {adminTab === "contacts" && (
                  <>
                    <div style={{ marginBottom: 30 }}>
                      <h4>📞 Phone Numbers</h4>
                      {contacts?.phones?.map((phone: string, idx: number) => (<div key={idx} className="contact-item"><span>{phone}</span><button className="btn-outline" style={{ background: "#dc3545", color: "#fff", padding: "4px 12px" }} onClick={() => deletePhone(idx)}>Delete</button></div>))}
                      <div style={{ display: "flex", gap: 10, marginTop: 15, flexWrap: "wrap" }}><input className="input-field" placeholder="New Phone Number" value={newPhone} onChange={e => setNewPhone(e.target.value)} style={{ flex: 1 }} /><button className="btn-gold" onClick={addPhone}>Add Phone</button></div>
                    </div>
                    <div>
                      <h4>📧 Email Addresses</h4>
                      {contacts?.emails?.map((email: string, idx: number) => (<div key={idx} className="contact-item"><span>{email}</span><button className="btn-outline" style={{ background: "#dc3545", color: "#fff", padding: "4px 12px" }} onClick={() => deleteEmail(idx)}>Delete</button></div>))}
                      <div style={{ display: "flex", gap: 10, marginTop: 15, flexWrap: "wrap" }}><input className="input-field" placeholder="New Email Address" value={newEmail} onChange={e => setNewEmail(e.target.value)} style={{ flex: 1 }} /><button className="btn-gold" onClick={addEmail}>Add Email</button></div>
                    </div>
                  </>
                )}

                {adminTab === "appearance" && (
                  <div className="dashboard-card">
                    <h4>Hero Section Background</h4>
                    <button className="btn-outline" onClick={() => heroImageRef.current?.click()} disabled={uploading}>📷 {uploading ? "Processing..." : "Upload New Background"}</button>
                    <input ref={heroImageRef} type="file" accept="image/*" onChange={uploadHeroImage} style={{ display: "none" }} />
                    {heroPreview && <img src={heroPreview} style={{ width: "100%", maxHeight: 200, objectFit: "cover", marginTop: 16, borderRadius: 8 }} alt="preview" />}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}