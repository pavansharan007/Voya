import React, { useState, useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { UserContext } from '../contexts/userContext';
import { User, Mail, Phone, Hash, Bike, IndianRupee, ClipboardList, ShieldCheck } from 'lucide-react';

const Account = () => {
  const { loggedIn, hasBike, refreshAuth,user } = useContext(UserContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData,setUserdata]=useState({})
  // Simulated User Data based on your format
  

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onBikeSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // API call to register bike
      await axios.post(`${import.meta.env.VITE_DEPLOY}/user/registerBike`, data, { withCredentials: true });
      await refreshAuth();
    } catch (error) {
      console.error("Registration failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-24">
      <div className="max-w-xl mx-auto px-6 pt-12">
        
        {/* Section 1: User Identity Card */}
        <section className="mb-12 text-center">
          <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-3xl mx-auto flex items-center justify-center mb-4 shadow-sm">
            <User className="text-gray-400" size={32} strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{user.fullname}</h1>
          <p className="text-gray-400 text-sm font-medium tracking-wide uppercase mt-1">ID: {user.uniqueId}</p>
        </section>

        {/* Section 2: Account Details Grid */}
        <section className="space-y-3 mb-12">
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1 mb-4">Account Information</h3>
          <div className="grid grid-cols-1 gap-3">
            <DetailItem icon={<Mail size={18}/>} label="Email" value={user.email} />
            <DetailItem icon={<Phone size={18}/>} label="Phone" value={user.phno} />
          </div>
        </section>

        {/* Section 3: Conditional Rendering (Bike Form vs Bike Status) */}
        <section className="bg-gray-50/50 border border-gray-100 rounded-[32px] p-8 shadow-sm">
          {!hasBike ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-600 rounded-2xl text-white">
                   <Bike size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Register Bike</h2>
                  <p className="text-sm text-gray-500">Enable earnings on your profile</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onBikeSubmit)} className="space-y-5">
                <InputGroup 
                   label="Bike Model Name" 
                   register={register("bikeName", { required: "Name is required" })}
                   placeholder="e.g. Splendor"
                   error={errors.bikeName}
                />
                <InputGroup 
                   label="Bike Registration Number" 
                   register={register("bikeNo", { required: "Number is required" })}
                   placeholder="e.g. AP39 BV 1234"
                   error={errors.bikeNo}
                />
                <InputGroup 
                   label="Fee per Hour (₹)" 
                   register={register("perHrFee", { required: "Fee is required" })}
                   placeholder="e.g. 50"
                   type="number"
                   error={errors.perHrFee}
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-sm tracking-wide hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
                >
                  {isSubmitting ? "Processing..." : "Submit Registration"}
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full mx-auto flex items-center justify-center mb-4">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-lg font-bold">Bike Registered</h2>
              <p className="text-sm text-gray-500 mt-1">Your bike is currently active for earnings.</p>
              
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

// --- Small Reusable UI Components ---

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl">
    <div className="flex items-center gap-3">
      <div className="text-gray-400">{icon}</div>
      <span className="text-sm text-gray-500 font-medium">{label}</span>
    </div>
    <span className="text-sm font-bold text-gray-800">{value}</span>
  </div>
);

const InputGroup = ({ label, register, placeholder, type = "text", error }) => (
  <div className="flex flex-col gap-2 text-left">
    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      type={type}
      {...register}
      placeholder={placeholder}
      className={`w-full px-5 py-4 bg-white border ${error ? 'border-red-300' : 'border-gray-100'} rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium`}
    />
    {error && <span className="text-[10px] text-red-500 font-bold ml-1">{error.message}</span>}
  </div>
);

export default Account;