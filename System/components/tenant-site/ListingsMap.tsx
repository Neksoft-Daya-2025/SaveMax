'use client';
import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import type { PublicProperty } from '@/lib/public-site';
import 'leaflet/dist/leaflet.css';
import s from './site.module.css';

export default function ListingsMap({ properties, selected, onSelect, currency }: { properties: PublicProperty[]; selected: string; onSelect: (id: string) => void; currency: string }) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const choose = useRef(onSelect);
  const active = useRef(selected);
  const redraw = useRef<(() => void) | null>(null);
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => { choose.current = onSelect; }, [onSelect]);
  useEffect(() => {
    let disposed = false; let observer: ResizeObserver | undefined;
    setReady(false); setError(false);
    import('leaflet').then(L => {
      if (disposed || !container.current) return;
      const instance = L.map(container.current, { zoomControl: false }).setView([52.15, 5.3], 7);
      map.current = instance;
      L.control.zoom({ position: 'bottomright' }).addTo(instance);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, referrerPolicy: 'origin', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(instance);
      const positioned = properties.filter(p => {
        const c = p.location.coordinates;
        return c && Number.isFinite(c.lat) && Number.isFinite(c.lng) && Math.abs(c.lat) <= 90 && Math.abs(c.lng) <= 180;
      });
      const bounds = L.latLngBounds(positioned.map(p => [p.location.coordinates!.lat, p.location.coordinates!.lng] as [number, number]));
      if (positioned.length) instance.fitBounds(bounds, { padding: [55, 55], maxZoom: 13 });
      const markers = L.layerGroup().addTo(instance);
      redraw.current = () => {
        markers.clearLayers();
        const groups = new Map<string, PublicProperty[]>();
        for (const property of positioned) {
          const c = property.location.coordinates!;
          const point = instance.project([c.lat, c.lng], instance.getZoom());
          const key = instance.getZoom() >= 16 ? property._id : `${Math.floor(point.x / 65)}:${Math.floor(point.y / 65)}`;
          groups.set(key, [...(groups.get(key) || []), property]);
        }
        for (const group of groups.values()) {
          const first = group[0], c = first.location.coordinates!;
          const label = document.createElement('span');
          label.className = `${s.mapPin} ${group.some(p => p._id === active.current) ? s.mapPinActive : ''}`;
          label.textContent = group.length > 1 ? String(group.length) : new Intl.NumberFormat('en-NL', { style: 'currency', currency, maximumFractionDigits: 0, notation: 'compact' }).format(first.price);
          const marker = L.marker([c.lat, c.lng], { icon: L.divIcon({ html: label, className: s.mapMarker, iconSize: [76, 34], iconAnchor: [38, 17] }), title: group.length > 1 ? `${group.length} properties — zoom in` : first.title });
          marker.on('click', () => {
            if (group.length > 1) instance.fitBounds(L.latLngBounds(group.map(p => [p.location.coordinates!.lat, p.location.coordinates!.lng] as [number, number])), { maxZoom: Math.min(instance.getZoom() + 3, 19), padding: [70, 70] });
            else choose.current(first._id);
          });
          marker.addTo(markers);
        }
      };
      instance.on('zoomend', () => redraw.current?.()); redraw.current();
      observer = new ResizeObserver(() => instance.invalidateSize()); observer.observe(container.current);
      setReady(true);
    }).catch(() => { if (!disposed) setError(true); });
    return () => { disposed = true; observer?.disconnect(); map.current?.remove(); map.current = null; redraw.current = null; };
  }, [properties, currency]);
  useEffect(() => {
    active.current = selected;
    const property = properties.find(p => p._id === selected), c = property?.location.coordinates;
    if (map.current && c && Number.isFinite(c.lat) && Number.isFinite(c.lng)) map.current.panTo([c.lat, c.lng]);
    redraw.current?.();
  }, [selected, properties]);
  return <div className={s.interactiveMap}>
    <div ref={container} className={s.mapCanvas} aria-label="Interactive property map" />
    {!ready && <p className={s.mapLoading} role="status">{error ? 'The map could not load. You can still browse every listing.' : 'Loading map…'}</p>}
    <p className={s.mapOverlay}>Showing locations for this results page. {properties.some(p => p.demo) ? 'Demo locations are illustrative.' : 'Locations may be approximate.'}</p>
  </div>;
}
