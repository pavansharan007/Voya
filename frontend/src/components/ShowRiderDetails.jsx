import React from "react";
import axios from "axios";



function ShowRiderDetails({riderId, bikeName, bikeNo, fullname, perHrFee, fromUserId,phno }) {

  const createRide = async() => {
    const res = await axios.post(`${import.meta.env.VITE_DEPLOY}/ride/createRide`, { BikeOwnerId : riderId},{withCredentials:true});
    console.log(res)
  }
  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-indigo-100">
      {/* Decorative accent for the card */}
      <div className="absolute top-0 left-0 h-full w-1 bg-indigo-500 opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          {/* Rider Name */}
          <p className="text-xs font-normal uppercase tracking-wider text-slate-400">
            {riderId}
          </p>
          <h1 className="text-lg font-bold text-slate-800 leading-tight">
            {fullname}
          </h1>

          {/* Bike Info Badge */}
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
              {bikeName || "Standard Bike"}
            </span>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
              {bikeNo}
            </span>
          </div>
          <h1 className="text-base font-bold text-slate-800 leading-tight">
            <span className="text-slate-600 text-sm">Phone no :</span>
            {phno}
          </h1>
        </div>

        {/* Pricing Section */}
        <div className="text-right">
          <p className="text-xs font-medium text-slate-500">Rate</p>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-slate-900">
              ₹{perHrFee}
            </span>
            <span className="text-xs text-slate-500">/hr</span>
          </div>
        </div>
      </div>

      {/* Action Button (SaaS Style) */}
      <button
        onClick={() => createRide(riderId)}
        className="mt-4 w-full rounded-lg bg-slate-900 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-600"
      >
        Request Connection
      </button>
    </div>
  );
}

export default ShowRiderDetails;
