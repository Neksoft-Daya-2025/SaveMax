/* Developed by RUDRA via NEKLLM */
import Link from 'next/link';
import { 
  MapPin, Home, BedDouble, Bath, Square, Building2, CheckCircle2, ChevronLeft, 
  Phone, Mail, FileText, Share2, Heart, Calendar, Clock, User, MessageSquare,
  ArrowRight, Shield, Star, Info, LayoutGrid, Globe, Facebook, Twitter, Instagram, Linkedin,
  Car, Wind
} from 'lucide-react';
import { connectToDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import Settings from "@/models/Settings";
import Unit from "@/models/Unit";
import { initModels } from "@/lib/initModels";
import BookingForm from "@/components/landing/BookingForm";

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectToDB();
  initModels();

  const propertyDoc = await Property.findById(id).populate('agent').lean();
  const settingsDoc = await Settings.findOne().lean();
  const unitsDocs = await Unit.find({ property: id }).lean();
  
  // Fetch similar properties
  const similarDocs = await Property.find({ 
    _id: { $ne: id },
    propertyType: propertyDoc?.propertyType 
  }).limit(3).lean();

  if (!propertyDoc) {
    return <div className="min-h-screen bg-white flex items-center justify-center"><p className="text-xl font-bold text-slate-500">Property not found.</p></div>;
  }

  const property = JSON.parse(JSON.stringify(propertyDoc));
  const settings = settingsDoc ? JSON.parse(JSON.stringify(settingsDoc)) : null;
  const units = JSON.parse(JSON.stringify(unitsDocs));
  const similarProperties = JSON.parse(JSON.stringify(similarDocs));

  const formatPrice = (price: number) => {
    const c = settings?.currency || 'USD';
    try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: c, maximumFractionDigits: 0 }).format(price); }
    catch { return `${c} ${price.toLocaleString()}`; }
  };

  const images = property.images || [];
  const mainImage = images[0]?.url || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-900 selection:text-white pt-24">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Gallery Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-10 h-[300px] md:h-[400px] lg:h-[500px]">
          <div className="lg:col-span-9 h-full relative group">
            <img src={mainImage} alt="Main" className="w-full h-full object-cover rounded-xl" />
            <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-slate-900 hover:bg-indigo-900 hover:text-white transition-all"><ChevronLeft className="w-6 h-6" /></button>
              <button className="w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-slate-900 hover:bg-indigo-900 hover:text-white transition-all"><ArrowRight className="w-6 h-6" /></button>
            </div>
          </div>
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 h-full">
            {[1, 2].map((i) => (
              <div key={i} className="flex-1 rounded-xl overflow-hidden relative">
                {images[i] ? (
                  <img src={images[i].url} alt={`Gallery ${i}`} className="w-full h-full object-cover hover:brightness-90 transition-all cursor-pointer" />
                ) : (
                  <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200 border-2 border-dashed border-slate-100 rounded-xl">
                    <LayoutGrid className="w-8 h-8" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-35">
          {/* Left Column: Details */}
          <div className="lg:col-span-8 space-y-10">
            {/* Header Info */}
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-3 h-3 rounded-sm bg-indigo-900" />
                  <span className="text-xs font-black text-indigo-900 uppercase tracking-widest">For {property.purpose}</span>
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-2">{property.title}</h1>
                <div className="flex items-center gap-2 text-slate-400 font-medium">
                  <MapPin className="w-4 h-4" />
                  <p>{property.location?.address}, {property.location?.city}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                  <Heart className="w-4 h-4" /> Save
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="flex gap-10 items-end">
              <div>
                <p className="text-2xl font-black text-indigo-900">{formatPrice(property.price)}</p>
              </div>
              {property.purpose === 'Rent' && (
                <div className="flex items-center gap-2 text-sm text-slate-500 font-bold">
                  <span>Down Payment:</span>
                  <span className="text-slate-900">{formatPrice(property.price * 0.2)}</span>
                </div>
              )}
            </div>

            {/* Key Details Grid */}
            <section>
              <h3 className="text-xl font-black text-slate-900 mb-6">Key Details</h3>
              <div className="flex gap-12">
                 <div className="flex items-center gap-3">
                    <BedDouble className="w-5 h-5 text-slate-400" />
                    <span className="text-sm font-bold text-slate-600">{property.bedrooms || 0} Beds</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <Bath className="w-5 h-5 text-slate-400" />
                    <span className="text-sm font-bold text-slate-600">{property.bathrooms || 0} Baths</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <Square className="w-5 h-5 text-slate-400" />
                    <span className="text-sm font-bold text-slate-600">{property.areaSize} {property.areaUnit}</span>
                 </div>
                 {property.parking && (
                   <div className="flex items-center gap-3">
                      <Car className="w-5 h-5 text-slate-400" />
                      <span className="text-sm font-bold text-slate-600">{property.parking} Parking</span>
                   </div>
                 )}
              </div>
            </section>

            {/* Description */}
            <section>
              <h3 className="text-xl font-black text-slate-900 mb-6">Description</h3>
              <div className="text-slate-500 leading-relaxed space-y-4 font-medium" 
                   dangerouslySetInnerHTML={{ __html: property.description?.replace(/\n/g, '<br/>') || 'No description provided.' }} />
            </section>

            {/* What This Place Offers */}
            {property.amenities && property.amenities.length > 0 && (
              <section className="pt-10 border-t border-slate-100">
                <h3 className="text-xl font-black text-slate-900 mb-8">What This Place Offers</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8">
                   {property.amenities.map((am: string, i: number) => (
                      <div key={i} className="flex items-center gap-4">
                        <CheckCircle2 className="w-5 h-5 text-indigo-900" />
                        <span className="text-sm font-bold text-slate-500">{am}</span>
                      </div>
                   ))}
                </div>
              </section>
            )}

            {/* Units Inventory - Visitor View */}
            {units && units.length > 0 && (
              <section className="pt-10 border-t border-slate-100">
                <h3 className="text-xl font-black text-slate-900 mb-8">Available Units</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {units.map((unit: any) => (
                    <div key={unit._id} className="p-6 rounded-2xl border border-slate-100 hover:border-indigo-900 hover:shadow-lg transition-all cursor-pointer group">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-bold text-slate-900 text-lg">Unit {unit.unitNumber}</p>
                          <p className="text-xs text-slate-400 font-bold">{unit.type} · Floor {unit.floor}</p>
                        </div>
                        <p className="font-black text-indigo-900">{formatPrice(unit.price)}</p>
                      </div>
                      <div className="flex gap-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" /> {unit.bedrooms || 0}</span>
                        <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {unit.bathrooms || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Booking Form */}
            <div className="lg:sticky lg:top-28">
              <BookingForm
                propertyId={property._id}
                propertyTitle={property.title}
                units={units}
              />

              {/* Agent Info Card */}
              <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm mt-8">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Listed By</p>
                <div className="flex items-center gap-4 mb-6">
                   {property.agent?.profileImage ? (
                     <img src={property.agent.profileImage} alt={property.agent.name} className="w-12 h-12 rounded-full object-cover" />
                   ) : (
                     <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <User className="w-6 h-6" />
                     </div>
                   )}
                   <div>
                      <h5 className="font-black text-slate-900">{property.agent?.name || "Managed Asset"}</h5>
                      <p className="text-xs text-slate-400 font-bold">{property.agent?.email || "Email not available"}</p>
                   </div>
                </div>
                <button className="w-full py-4 rounded-xl border-2 border-indigo-900 text-indigo-900 font-black text-sm hover:bg-indigo-900 hover:text-white transition-all">
                  Contact Agent
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <section className="mt-24">
            <h3 className="text-2xl font-black text-slate-900 mb-10">Similar properties</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {similarProperties.map((p: any) => (
                <div key={p._id} className="group cursor-pointer">
                  <div className="relative h-[240px] rounded-2xl overflow-hidden mb-6">
                    <img src={p.images?.[0]?.url || mainImage} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Heart className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-lg font-black text-slate-900 mb-1">{p.title}</h4>
                  <div className="flex items-center gap-2 text-slate-400 text-sm font-bold mb-4">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{p.location?.city}</span>
                  </div>
                  <div className="flex gap-6 mb-6">
                     <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <BedDouble className="w-4 h-4" /> {p.bedrooms || 0}
                     </div>
                     <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <Bath className="w-4 h-4" /> {p.bathrooms || 0}
                     </div>
                     <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <Square className="w-4 h-4" /> {p.areaSize} {p.areaUnit}
                     </div>
                  </div>
                  <div className="flex items-center justify-between">
                     <p className="text-xl font-black text-slate-900">{formatPrice(p.price)}</p>
                     <Link href={`/property/${p._id}`} className="px-6 py-3 rounded-xl bg-indigo-900 text-white font-black text-xs hover:bg-indigo-800 transition-all shadow-lg shadow-indigo-900/20">
                        View Details →
                     </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
