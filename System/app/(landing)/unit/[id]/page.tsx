import Link from 'next/link';
import { MapPin, BedDouble, Bath, Square, Building2, CheckCircle2, ChevronLeft, Phone, Mail, Layers, DoorOpen, Compass, Wind } from 'lucide-react';
import { connectToDB } from "@/lib/mongodb";
import Unit from "@/models/Unit";
import Settings from "@/models/Settings";
import { initModels } from "@/lib/initModels";
import BookingForm from "@/components/landing/BookingForm";

export default async function UnitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectToDB();
  initModels();

  const unitDoc = await Unit.findById(id).populate('property', 'title location propertyType purpose').lean();
  const settingsDoc = await Settings.findOne().lean();

  if (!unitDoc) {
    return <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center"><p className="text-xl font-bold text-slate-500">Unit not found.</p></div>;
  }

  const unit = JSON.parse(JSON.stringify(unitDoc));
  const property = unit.property || {};
  const settings = settingsDoc ? JSON.parse(JSON.stringify(settingsDoc)) : null;

  const formatPrice = (price: number) => {
    const c = settings?.currency || 'USD';
    try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: c, maximumFractionDigits: 0 }).format(price); }
    catch { return `${c} ${price.toLocaleString()}`; }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-900 font-sans selection:bg-indigo-900 selection:text-white pt-24">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-900 text-xs font-bold uppercase tracking-wider rounded">
                {unit.status}
              </span>
              <span className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded">
                Unit {unit.unitNumber}
              </span>
              {property.purpose && (
                <span className="px-3 py-1 bg-indigo-900 text-white text-xs font-bold uppercase tracking-wider rounded">
                  For {property.purpose}
                </span>
              )}
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-2">{property.title || 'Premium Unit'} - Unit {unit.unitNumber}</h1>
            <p className="flex items-center gap-2 text-slate-500">
              <MapPin className="w-5 h-5 text-indigo-900" />
              {property.location?.address}, {property.location?.city}, {property.location?.state} {property.location?.zipCode}
            </p>
          </div>
          <div className="md:text-right">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Unit Price</p>
            <p className="text-4xl font-extrabold text-indigo-900">
              {formatPrice(unit.price)}
              {property.purpose === 'Rent' && <span className="text-lg text-slate-500 font-medium">/mo</span>}
            </p>
          </div>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 h-[500px]">
          <div className="md:col-span-2 bg-slate-200 rounded-2xl overflow-hidden h-full relative">
            {unit.images?.[0]?.url ? (
              <img src={unit.images[0].url} alt="Main" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            ) : property.images?.[0]?.url ? (
              <img src={property.images[0].url} alt="Property" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            ) : <div className="w-full h-full flex items-center justify-center text-slate-400"><Layers className="w-16 h-16" /></div>}
            <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg font-bold text-slate-900 shadow-lg">
              Block {unit.block || 'N/A'} • Floor {unit.floor || 'N/A'}
            </div>
          </div>
          <div className="hidden md:flex flex-col gap-4 h-full">
            {[1, 2].map((i) => (
              <div key={i} className="flex-1 bg-slate-200 rounded-2xl overflow-hidden">
                 {unit.images?.[i]?.url ? (
                  <img src={unit.images[i].url} alt={`Gallery ${i}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                ) : property.images?.[i]?.url ? (
                  <img src={property.images[i].url} alt={`Property Gallery ${i}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                ) : <div className="w-full h-full flex items-center justify-center text-slate-400"><Layers className="w-8 h-8" /></div>}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Details */}
          <div className="lg:col-span-2 space-y-12">
            {/* Key Specs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center shrink-0"><BedDouble className="w-6 h-6 text-indigo-900" /></div>
                <div><p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Bedrooms</p><p className="font-bold text-slate-900 text-lg">{unit.bedrooms ?? 'N/A'}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center shrink-0"><Bath className="w-6 h-6 text-indigo-900" /></div>
                <div><p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Bathrooms</p><p className="font-bold text-slate-900 text-lg">{unit.bathrooms ?? 'N/A'}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center shrink-0"><Square className="w-6 h-6 text-indigo-900" /></div>
                <div><p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Square Feet</p><p className="font-bold text-slate-900 text-lg">{unit.areaSize || 'N/A'}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center shrink-0"><DoorOpen className="w-6 h-6 text-indigo-900" /></div>
                <div><p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Unit Type</p><p className="font-bold text-slate-900 text-lg">{unit.type || 'Standard'}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center shrink-0"><Compass className="w-6 h-6 text-indigo-900" /></div>
                <div><p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Facing</p><p className="font-bold text-slate-900 text-lg">{unit.facing || 'N/A'}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center shrink-0"><Wind className="w-6 h-6 text-indigo-900" /></div>
                <div><p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Windows</p><p className="font-bold text-slate-900 text-lg">{unit.windows ?? 'N/A'}</p></div>
              </div>
              <div className="flex items-center gap-3 col-span-2">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center shrink-0"><Layers className="w-6 h-6 text-indigo-900" /></div>
                <div><p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Corner Unit</p><p className="font-bold text-slate-900 text-lg">{unit.isCorner ? 'Yes' : 'No'}</p></div>
              </div>
            </div>

            {/* Features */}
            {unit.features && unit.features.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2"><CheckCircle2 className="w-6 h-6 text-indigo-900" /> Unit Features</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
                  {unit.features.map((ft: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 text-slate-700 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" /> <span className="font-medium">{ft}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar / Contact */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Interested in Unit {unit.unitNumber}?</h3>
              
              <div className="space-y-4">
                {settings?.phone && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0"><Phone className="w-5 h-5 text-indigo-900" /></div>
                    <div><p className="text-xs text-indigo-900/60 uppercase font-bold tracking-wider mb-0.5">Call Us</p><p className="font-bold text-indigo-900">{settings.phone}</p></div>
                  </div>
                )}
                {settings?.email && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0"><Mail className="w-5 h-5 text-indigo-900" /></div>
                    <div><p className="text-xs text-indigo-900/60 uppercase font-bold tracking-wider mb-0.5">Email Us</p><p className="font-bold text-indigo-900 truncate max-w-[180px]">{settings.email}</p></div>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Form */}
            <BookingForm
              propertyId={property._id}
              propertyTitle={property.title || 'Property'}
              units={[{ _id: unit._id, unitNumber: unit.unitNumber, type: unit.type, floor: unit.floor, price: unit.price }]}
              defaultUnitId={unit._id}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
