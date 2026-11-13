// frontend/src/components/GrievanceGeospatialMap.jsx
// Authentic Bangalore Geospatial Grievance GIS Command Center with Dynamic Full-Breadth & Split Inspection
// City-Wide Uniform 10-Zone Omnidirectional Radial Scattering (Eliminates Dense Clustering & Straight Lines)
// Supports High-Resolution Satellite Photography, Hybrid Road Overlay, and Municipal GIS Street Views

import React, { useState, useMemo, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Building2,
  Droplets,
  Zap,
  Car,
  Trash2,
  FileText,
  AlertTriangle,
  Clock,
  UserCheck,
  Search,
  CheckCircle2,
  ExternalLink,
  Edit3,
  Layers,
  Filter,
  Maximize2,
  Minimize2,
  X,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Compass,
  Phone,
  ShieldCheck,
  Calendar,
  Satellite,
  Globe,
  Hand
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// Central Bangalore Geographic Coordinates (Vidhana Soudha / MG Road)
export const BENGALURU_CENTER = { lat: 12.9716, lon: 77.5946 };

// 10 Balanced Municipal Administrative Zones covering the entire geographical span of Greater Bengaluru
export const BENGALURU_ZONES = [
  {
    name: 'Central Zone (CBD)',
    hubs: [
      { name: 'MG Road / Brigade Road (CBD)', lat: 12.9756, lon: 77.6066, zone: 'Central Zone', ward: 'Ward 111' },
      { name: 'Vidhana Soudha / Cubbon Park', lat: 12.9797, lon: 77.5912, zone: 'Central Zone', ward: 'Ward 112' },
      { name: 'Ulsoor Lake / Someshwara', lat: 12.9817, lon: 77.6200, zone: 'Central Zone', ward: 'Ward 90' },
      { name: 'Shivajinagar / Russell Market', lat: 12.9863, lon: 77.6045, zone: 'Central Zone', ward: 'Ward 92' },
      { name: 'Richmond Town / Langford Town', lat: 12.9632, lon: 77.6015, zone: 'Central Zone', ward: 'Ward 115' },
      { name: 'Shanthi Nagar / Double Road', lat: 12.9540, lon: 77.5950, zone: 'Central Zone', ward: 'Ward 117' }
    ]
  },
  {
    name: 'East Zone',
    hubs: [
      { name: 'Indiranagar 100 Feet Road', lat: 12.9784, lon: 77.6408, zone: 'East Zone', ward: 'Ward 80' },
      { name: 'Indiranagar 12th Main', lat: 12.9715, lon: 77.6410, zone: 'East Zone', ward: 'Ward 81' },
      { name: 'Domlur / EGL Inner Ring Road', lat: 12.9609, lon: 77.6387, zone: 'East Zone', ward: 'Ward 114' },
      { name: 'HAL Old Airport Road', lat: 12.9560, lon: 77.6580, zone: 'East Zone', ward: 'Ward 83' },
      { name: 'CV Raman Nagar / DRDO', lat: 12.9850, lon: 77.6650, zone: 'East Zone', ward: 'Ward 82' },
      { name: 'Frazer Town / Coles Road', lat: 12.9968, lon: 77.6130, zone: 'East Zone', ward: 'Ward 78' },
      { name: 'Kalyan Nagar / HRBR Layout', lat: 13.0195, lon: 77.6432, zone: 'East Zone', ward: 'Ward 29' },
      { name: 'KR Puram Hanging Bridge', lat: 13.0075, lon: 77.6959, zone: 'East Zone', ward: 'Ward 52' }
    ]
  },
  {
    name: 'Mahadevapura Zone (East Tech Corridor)',
    hubs: [
      { name: 'Whitefield ITPL Main Road', lat: 12.9698, lon: 77.7499, zone: 'Mahadevapura Zone', ward: 'Ward 84' },
      { name: 'Whitefield Kadugodi Station', lat: 12.9980, lon: 77.7550, zone: 'Mahadevapura Zone', ward: 'Ward 85' },
      { name: 'Marathahalli ORR Junction', lat: 12.9591, lon: 77.6974, zone: 'Mahadevapura Zone', ward: 'Ward 86' },
      { name: 'Bellandur Ecospace Outer Ring Road', lat: 12.9304, lon: 77.6784, zone: 'Mahadevapura Zone', ward: 'Ward 150' },
      { name: 'Varthur Main Lake Road', lat: 12.9390, lon: 77.7440, zone: 'Mahadevapura Zone', ward: 'Ward 149' },
      { name: 'Brookefield / Kundalahalli', lat: 12.9650, lon: 77.7180, zone: 'Mahadevapura Zone', ward: 'Ward 87' }
    ]
  },
  {
    name: 'South Zone (Jayanagar & BTM)',
    hubs: [
      { name: 'Koramangala 5th Block (Sony Signal)', lat: 12.9352, lon: 77.6245, zone: 'South Zone', ward: 'Ward 151' },
      { name: 'Koramangala 3rd Block 80ft Road', lat: 12.9280, lon: 77.6290, zone: 'South Zone', ward: 'Ward 152' },
      { name: 'Jayanagar 4th Block Complex', lat: 12.9298, lon: 77.5838, zone: 'South Zone', ward: 'Ward 153' },
      { name: 'Jayanagar 9th Block East End', lat: 12.9180, lon: 77.5940, zone: 'South Zone', ward: 'Ward 154' },
      { name: 'JP Nagar 2nd Phase', lat: 12.9120, lon: 77.5850, zone: 'South Zone', ward: 'Ward 177' },
      { name: 'JP Nagar 6th Phase Ring Road', lat: 12.9073, lon: 77.5783, zone: 'South Zone', ward: 'Ward 178' },
      { name: 'BTM Layout 2nd Stage Udupi Garden', lat: 12.9166, lon: 77.6101, zone: 'South Zone', ward: 'Ward 176' },
      { name: 'Basavanagudi Gandhi Bazaar', lat: 12.9421, lon: 77.5752, zone: 'South Zone', ward: 'Ward 155' },
      { name: 'Banashankari 2nd Stage BDA', lat: 12.9255, lon: 77.5468, zone: 'South Zone', ward: 'Ward 160' },
      { name: 'Padmanabhanagar', lat: 12.9180, lon: 77.5580, zone: 'South Zone', ward: 'Ward 182' }
    ]
  },
  {
    name: 'Bommanahalli & South Suburbs',
    hubs: [
      { name: 'HSR Layout Sector 1 Agara', lat: 12.9110, lon: 77.6520, zone: 'Bommanahalli Zone', ward: 'Ward 174' },
      { name: 'HSR Layout Sector 4 BDA', lat: 12.9165, lon: 77.6360, zone: 'Bommanahalli Zone', ward: 'Ward 175' },
      { name: 'Bommanahalli Junction', lat: 12.9030, lon: 77.6240, zone: 'Bommanahalli Zone', ward: 'Ward 176' },
      { name: 'Electronic City Phase 1 Infosys', lat: 12.8399, lon: 77.6770, zone: 'South Suburbs', ward: 'Ward 192' },
      { name: 'Electronic City Phase 2', lat: 12.8480, lon: 77.6850, zone: 'South Suburbs', ward: 'Ward 193' },
      { name: 'Bannerghatta Road Arekere', lat: 12.8876, lon: 77.5978, zone: 'South Zone', ward: 'Ward 186' },
      { name: 'Hulimavu Gate / Meenakshi', lat: 12.8750, lon: 77.5970, zone: 'South Zone', ward: 'Ward 187' }
    ]
  },
  {
    name: 'West Zone',
    hubs: [
      { name: 'Malleshwaram Sampige Road', lat: 13.0031, lon: 77.5701, zone: 'West Zone', ward: 'Ward 65' },
      { name: 'Rajajinagar Navrang Circle', lat: 12.9982, lon: 77.5530, zone: 'West Zone', ward: 'Ward 98' },
      { name: 'Vijayanagar Pipeline Road', lat: 12.9719, lon: 77.5306, zone: 'West Zone', ward: 'Ward 123' },
      { name: 'Basaveshwaranagar 80ft Road', lat: 12.9870, lon: 77.5380, zone: 'West Zone', ward: 'Ward 100' },
      { name: 'Mahalakshmi Layout', lat: 13.0130, lon: 77.5480, zone: 'West Zone', ward: 'Ward 68' }
    ]
  },
  {
    name: 'Rajarajeshwari Nagar Zone',
    hubs: [
      { name: 'Nagarbhavi BDA Complex', lat: 12.9610, lon: 77.5090, zone: 'RR Nagar Zone', ward: 'Ward 128' },
      { name: 'Chandra Layout 80ft Road', lat: 12.9560, lon: 77.5250, zone: 'RR Nagar Zone', ward: 'Ward 129' },
      { name: 'Kengeri Satellite Town', lat: 12.9177, lon: 77.4837, zone: 'RR Nagar Zone', ward: 'Ward 159' },
      { name: 'Rajarajeshwari Nagar BEML', lat: 12.9230, lon: 77.5180, zone: 'RR Nagar Zone', ward: 'Ward 160' }
    ]
  },
  {
    name: 'North Zone',
    hubs: [
      { name: 'Hebbal Flyover / Bellary Road', lat: 13.0358, lon: 77.5970, zone: 'North Zone', ward: 'Ward 18' },
      { name: 'RT Nagar Main Road', lat: 13.0184, lon: 77.5934, zone: 'North Zone', ward: 'Ward 21' },
      { name: 'Sahakar Nagar Main Road', lat: 13.0624, lon: 77.5912, zone: 'North Zone', ward: 'Ward 8' },
      { name: 'Sanjaynagar / RMV 2nd Stage', lat: 13.0310, lon: 77.5780, zone: 'North Zone', ward: 'Ward 19' },
      { name: 'Sadashivanagar Sankey Tank', lat: 13.0080, lon: 77.5810, zone: 'North Zone', ward: 'Ward 64' },
      { name: 'Nagawara Manyata Tech Park', lat: 13.0485, lon: 77.6215, zone: 'North Zone', ward: 'Ward 23' },
      { name: 'Vidyaranyapura BEL Circle', lat: 13.0825, lon: 77.5583, zone: 'North Zone', ward: 'Ward 9' }
    ]
  },
  {
    name: 'Dasarahalli & North-West Zone',
    hubs: [
      { name: 'Peenya Industrial Area 1st Stage', lat: 13.0285, lon: 77.5197, zone: 'Dasarahalli Zone', ward: 'Ward 41' },
      { name: 'Yeshwanthpur Market Metro', lat: 13.0238, lon: 77.5489, zone: 'North-West Zone', ward: 'Ward 37' },
      { name: 'Jalahalli Cross', lat: 13.0460, lon: 77.5270, zone: 'North-West Zone', ward: 'Ward 16' },
      { name: 'Mathikere / IISc Outer Road', lat: 13.0320, lon: 77.5590, zone: 'North-West Zone', ward: 'Ward 36' }
    ]
  },
  {
    name: 'Yelahanka Zone',
    hubs: [
      { name: 'Yelahanka New Town 4th Phase', lat: 13.1007, lon: 77.5963, zone: 'Yelahanka Zone', ward: 'Ward 4' },
      { name: 'Yelahanka Old Town Market', lat: 13.1090, lon: 77.6040, zone: 'Yelahanka Zone', ward: 'Ward 3' },
      { name: 'Kogilu Cross Airport Road', lat: 13.1180, lon: 77.6180, zone: 'Yelahanka Zone', ward: 'Ward 5' },
      { name: 'Dibbur / Presidency University Gate', lat: 13.1683, lon: 77.5330, zone: 'Yelahanka Zone', ward: 'Ward 1' },
      { name: 'Rajanukunte Junction', lat: 13.1743, lon: 77.5638, zone: 'Yelahanka Zone', ward: 'Ward 2' }
    ]
  }
];

// Flat list of all 60+ Bangalore municipal localities for backward compatibility
export const BANGALORE_LOCALITIES = BENGALURU_ZONES.flatMap((z) => z.hubs);

// Preserved for backward compatibility
export const SECTOR_COORDS = {
  'Sector 1': { x: 22, y: 24, zone: 'North Zone' },
  'Sector 2': { x: 74, y: 28, zone: 'East Zone' },
  'Sector 3': { x: 52, y: 74, zone: 'South Zone' },
  'Sector 4': { x: 20, y: 66, zone: 'West Zone' },
  'Sector 5': { x: 50, y: 46, zone: 'Central Zone' }
};

// High-entropy 32-bit FNV-1a deterministic string hash for stable 2D scattering
function hashGrievance(grievance, idx = 0) {
  const str = `${grievance?.id || ''}_${grievance?.title || ''}_${grievance?.location || ''}_${idx}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// Convert Bangalore geographic coords to relative 0-100 plot coords for legacy SVG consumers
export const derivePlotCoords = (grievance, idx = 0) => {
  const coords = deriveBangaloreCoords(grievance, idx);
  return {
    x: Math.min(94, Math.max(6, 50 + (coords.lon - BENGALURU_CENTER.lon) * 260)),
    y: Math.min(94, Math.max(6, 50 - (coords.lat - BENGALURU_CENTER.lat) * 260)),
    sectorLabel: coords.locality
  };
};

/**
 * Deterministically maps grievances onto realistic, scattered Bangalore geographic coordinates.
 * Disperses complaints evenly across all 10 municipal zones of Greater Bengaluru.
 * Eliminates artificial clumping and straight lines through 360-degree radial scattering.
 */
export const deriveBangaloreCoords = (grievance, idx = 0) => {
  if (!grievance) {
    return { lat: BENGALURU_CENTER.lat, lon: BENGALURU_CENTER.lon, locality: 'Bengaluru Central', ward: 'BBMP', zone: 'Central Zone' };
  }

  const hash = hashGrievance(grievance, idx);
  const text = `${grievance.location || ''} ${grievance.landmark || ''} ${grievance.sector || ''} ${grievance.title || ''}`.toLowerCase();

  let targetZone = null;
  let targetHub = null;

  // 1. Explicit locality anchor matching (if citizen mentions a specific distinct neighborhood)
  if (text.includes('dibbur') || text.includes('presidency')) {
    targetZone = BENGALURU_ZONES[9]; targetHub = targetZone.hubs[3];
  } else if (text.includes('whitefield') || text.includes('itpl')) {
    targetZone = BENGALURU_ZONES[2]; targetHub = targetZone.hubs[0];
  } else if (text.includes('indiranagar')) {
    targetZone = BENGALURU_ZONES[1]; targetHub = targetZone.hubs[0];
  } else if (text.includes('koramangala')) {
    targetZone = BENGALURU_ZONES[3]; targetHub = targetZone.hubs[0];
  } else if (text.includes('jayanagar')) {
    targetZone = BENGALURU_ZONES[3]; targetHub = targetZone.hubs[2];
  } else if (text.includes('malleshwaram')) {
    targetZone = BENGALURU_ZONES[5]; targetHub = targetZone.hubs[0];
  } else if (text.includes('peenya')) {
    targetZone = BENGALURU_ZONES[8]; targetHub = targetZone.hubs[0];
  } else if (text.includes('kengeri')) {
    targetZone = BENGALURU_ZONES[6]; targetHub = targetZone.hubs[2];
  } else if (text.includes('electronic city')) {
    targetZone = BENGALURU_ZONES[4]; targetHub = targetZone.hubs[3];
  } else if (text.includes('bannerghatta')) {
    targetZone = BENGALURU_ZONES[4]; targetHub = targetZone.hubs[5];
  } else if (text.includes('hebbal')) {
    targetZone = BENGALURU_ZONES[7]; targetHub = targetZone.hubs[0];
  } else if (text.includes('rajajinagar')) {
    targetZone = BENGALURU_ZONES[5]; targetHub = targetZone.hubs[1];
  } else if (text.includes('vijayanagar')) {
    targetZone = BENGALURU_ZONES[5]; targetHub = targetZone.hubs[2];
  } else if (text.includes('vidyaranyapura')) {
    targetZone = BENGALURU_ZONES[7]; targetHub = targetZone.hubs[6];
  } else if (text.includes('mg road') || text.includes('cubbon')) {
    targetZone = BENGALURU_ZONES[0]; targetHub = targetZone.hubs[0];
  }

  // 2. Uniform 10-Zone Distribution for generic civic tickets
  // Ensures grievances are evenly scattered across Central, North, South, East, West, RR Nagar,
  // Mahadevapura, Bommanahalli, Dasarahalli, and Yelahanka instead of piling up in one spot!
  if (!targetZone || !targetHub) {
    const zoneIdx = (hash + idx) % BENGALURU_ZONES.length;
    targetZone = BENGALURU_ZONES[zoneIdx];
    const hubIdx = ((hash >>> 3) + idx * 3) % targetZone.hubs.length;
    targetHub = targetZone.hubs[hubIdx];
  }

  // 3. Natural 360-degree omnidirectional radial scatter around the zone hub
  // Spreads pins along surrounding roads, junctions, and residential layouts (500m to 2.2km)
  const u1 = (((hash ^ (idx * 79)) & 0xffff) / 65535);
  const u2 = ((((hash >>> 16) ^ (idx * 113)) & 0xffff) / 65535);

  const angle = u1 * Math.PI * 2; // Full omnidirectional spread in all directions (NW, NE, SE, SW)
  const radius = 0.005 + (u2 * 0.018); // ~550m to ~2.1km organic spread

  return {
    lat: targetHub.lat + Math.sin(angle) * radius,
    lon: targetHub.lon + Math.cos(angle) * (radius * 1.08), // Aspect ratio compensation for Bangalore latitude
    locality: targetHub.name,
    ward: targetHub.ward,
    zone: targetZone.name,
    isGps: false
  };
};

export const CORE_DEPT_FILTERS = [
  {
    id: 'ALL',
    label: 'All Departments',
    icon: Building2,
    color: '#2C5745',
    deptKey: null,
    keywords: []
  },
  {
    id: 'ROAD',
    label: 'Roads & Infrastructure',
    icon: Car,
    color: '#D97706',
    deptKey: 'Public Works & Infrastructure',
    keywords: ['road', 'pothole', 'pavement', 'bridge', 'culvert', 'infrastructure', 'traffic', 'tar', 'footpath']
  },
  {
    id: 'WATER',
    label: 'Water & Drainage',
    icon: Droplets,
    color: '#0284C7',
    deptKey: 'Water Supply & Sanitation',
    keywords: ['water', 'drainage', 'sewer', 'sewage', 'pipeline', 'leak', 'tap', 'contamination', 'flood']
  },
  {
    id: 'HEALTH',
    label: 'Sanitation & Waste',
    icon: Trash2,
    color: '#16A34A',
    deptKey: 'Health & Hygiene',
    keywords: ['garbage', 'waste', 'hygiene', 'sanitation', 'debris', 'cleaning', 'dump', 'dead animal']
  },
  {
    id: 'ELECTRIC',
    label: 'Electricity & Lighting',
    icon: Zap,
    color: '#EA580C',
    deptKey: 'Electrical & Infrastructure',
    keywords: ['electric', 'light', 'lamp', 'power', 'transformer', 'wire', 'pole', 'blackout']
  },
  {
    id: 'REVENUE',
    label: 'Revenue & Records',
    icon: FileText,
    color: '#7C3AED',
    deptKey: 'Revenue & Taxation',
    keywords: ['revenue', 'tax', 'property', 'land', 'khata', 'mutation', 'certificate', 'assessment']
  }
];

export const isGrievanceInDeptFilter = (g, filterId) => {
  if (!g) return false;
  if (!filterId || filterId === 'ALL') return true;

  const cfg = CORE_DEPT_FILTERS.find((f) => f.id === filterId);
  const dept = (g.department || '').toLowerCase();
  const cat = (g.category || '').toLowerCase();
  const title = (g.title || '').toLowerCase();
  const text = `${dept} ${cat} ${title}`;

  if (cfg) {
    if (cfg.deptKey && (dept.includes(cfg.deptKey.toLowerCase()) || cfg.deptKey.toLowerCase().includes(dept))) {
      return true;
    }
    if (cfg.keywords && cfg.keywords.some((kw) => text.includes(kw))) {
      return true;
    }
    return false;
  }

  return dept === filterId.toLowerCase();
};

export default function GrievanceGeospatialMap({
  grievances = [],
  departments = [],
  initialDept = 'ALL',
  onSelectGrievance,
  onOpenAction,
  onClaimGrievance,
  user
}) {
  const { t } = useLanguage();

  const [activeDept, setActiveDept] = useState(initialDept || 'ALL');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [includeResolved, setIncludeResolved] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [forceFullWidth, setForceFullWidth] = useState(false);
  
  // Satellite and Map Style Mode: 'hybrid' (default), 'satellite', or 'streets'
  const [mapMode, setMapMode] = useState('hybrid');

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const baseTileLayerRef = useRef(null);
  const labelsTileLayerRef = useRef(null);
  const markersGroupRef = useRef(null);

  // Compute live department counts
  const deptCounts = useMemo(() => {
    const counts = {};
    counts['ALL'] = grievances.filter((g) => includeResolved || !['Resolved', 'Rejected'].includes(g.status)).length;

    for (const f of CORE_DEPT_FILTERS) {
      if (f.id === 'ALL') continue;
      counts[f.id] = grievances.filter((g) => {
        if (!includeResolved && ['Resolved', 'Rejected'].includes(g.status)) return false;
        return isGrievanceInDeptFilter(g, f.id);
      }).length;
    }
    return counts;
  }, [grievances, includeResolved]);

  // Filtered grievances mapped to Bangalore coordinates with scattered layout
  const mappedGrievances = useMemo(() => {
    return grievances
      .filter((g) => {
        if (!includeResolved && ['Resolved', 'Rejected'].includes(g.status)) return false;
        if (!isGrievanceInDeptFilter(g, activeDept)) return false;
        if (priorityFilter !== 'All' && g.priority !== priorityFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const hay = `${g.id} ${g.title} ${g.location} ${g.category} ${g.department} ${g.citizenName} ${g.assignedOfficer || ''}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .map((g, idx) => {
        const bCoords = deriveBangaloreCoords(g, idx);
        return {
          ...g,
          bangaloreCoords: bCoords,
          coords: {
            x: 50,
            y: 50,
            sectorLabel: bCoords.locality
          }
        };
      });
  }, [grievances, activeDept, priorityFilter, includeResolved, searchQuery]);

  const activeTicket = useMemo(() => {
    if (selectedTicketId) {
      const found = mappedGrievances.find((g) => g.id === selectedTicketId);
      if (found) return found;
    }
    return null;
  }, [mappedGrievances, selectedTicketId]);

  const activeFilterMeta = useMemo(() => {
    const f = CORE_DEPT_FILTERS.find((item) => item.id === activeDept);
    return f || { id: activeDept, label: activeDept, icon: Building2, color: '#2C5745' };
  }, [activeDept]);

  const urgentCountInView = mappedGrievances.filter((g) => g.priority === 'Urgent' || g.status === 'Escalated').length;

  // Active split mode: True when a ticket is selected and user hasn't explicitly minimized to full width
  const isSplitMode = Boolean(activeTicket) && !forceFullWidth;

  // 1. Initialize Leaflet Map Centered on Bangalore
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [BENGALURU_CENTER.lat, BENGALURU_CENTER.lon],
        zoom: 12,
        minZoom: 10,
        maxZoom: 18,
        zoomControl: false
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Manage Dynamic Tile Layers (Satellite, Hybrid, Streets)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clean up existing tile layers
    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
      baseTileLayerRef.current = null;
    }
    if (labelsTileLayerRef.current) {
      map.removeLayer(labelsTileLayerRef.current);
      labelsTileLayerRef.current = null;
    }

    if (mapMode === 'satellite' || mapMode === 'hybrid') {
      // High-resolution Esri World Imagery (Satellite photography)
      const satLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics, USDA, USGS, AeroGRID, IGN • BBMP GIS',
          maxZoom: 19
        }
      ).addTo(map);
      baseTileLayerRef.current = satLayer;

      if (mapMode === 'hybrid') {
        // Overlay reference street labels, arterial roads, and landmarks on top of satellite imagery
        const labelsLayer = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          {
            attribution: '',
            maxZoom: 19,
            opacity: 0.95
          }
        ).addTo(map);
        labelsTileLayerRef.current = labelsLayer;
      }
    } else {
      // Standard OpenStreetMap street cartography
      const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors • BBMP GIS',
        maxZoom: 19
      }).addTo(map);
      baseTileLayerRef.current = streetLayer;
    }
  }, [mapMode]);

  // 3. Render High-Contrast Markers for All Scattered Grievances
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    mappedGrievances.forEach((ticket) => {
      const isSelected = activeTicket?.id === ticket.id;
      const isResolved = ticket.status === 'Resolved';
      const isUrgent = ticket.priority === 'Urgent' || ticket.status === 'Escalated';
      const isHigh = ticket.priority === 'High';

      const pinColor = isResolved
        ? '#16a34a'
        : isUrgent
          ? '#dc2626'
          : isHigh
            ? '#ea580c'
            : '#2563EB';

      // Enhanced high-contrast shadow so pins pop boldly against satellite terrain
      const pulseStyle = isUrgent && !isResolved
        ? 'box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.45), 0 3px 10px rgba(0,0,0,0.6);'
        : isSelected
          ? 'box-shadow: 0 0 0 5px rgba(235, 125, 0, 0.65), 0 4px 14px rgba(0,0,0,0.7);'
          : 'box-shadow: 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.3);';

      const iconHtml = `
        <div style="
          width: ${isSelected ? '34px' : '26px'};
          height: ${isSelected ? '34px' : '26px'};
          border-radius: 50%;
          background: ${pinColor};
          border: ${isSelected ? '3px solid #EB7D00' : '2px solid #ffffff'};
          color: #ffffff;
          font-size: ${isSelected ? '13px' : '11px'};
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          ${pulseStyle}
          transition: transform 0.18s ease;
          cursor: pointer;
        ">
          ${isResolved ? '✓' : '!'}
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-bangalore-pin',
        iconSize: [isSelected ? 34 : 26, isSelected ? 34 : 26],
        iconAnchor: [isSelected ? 17 : 13, isSelected ? 17 : 13]
      });

      const marker = L.marker([ticket.bangaloreCoords.lat, ticket.bangaloreCoords.lon], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : isUrgent ? 500 : 100
      });

      marker.bindTooltip(
        `<div style="font-family: inherit; font-size: 12px; line-height: 1.35;">
          <strong style="color: #1e293b;">${ticket.id}</strong> • <span style="color: #64748b;">${ticket.bangaloreCoords.locality}</span><br/>
          <span style="color: #0f172a; font-weight: 600;">${ticket.title.slice(0, 48)}</span><br/>
          <span style="font-size: 10px; color: ${pinColor}; font-weight: 700;">${ticket.priority} • ${ticket.status}</span>
        </div>`,
        { direction: 'top', offset: [0, -12], opacity: 0.98 }
      );

      marker.on('click', () => {
        setSelectedTicketId(ticket.id);
        setForceFullWidth(false);
        if (onSelectGrievance) onSelectGrievance(ticket);
      });

      markersGroup.addLayer(marker);
    });
  }, [mappedGrievances, activeTicket, onSelectGrievance]);

  // 4. Smooth flyTo when an active ticket is selected
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !activeTicket) return;

    map.flyTo([activeTicket.bangaloreCoords.lat, activeTicket.bangaloreCoords.lon], Math.max(map.getZoom(), 14), {
      duration: 0.8
    });
  }, [activeTicket]);

  // 5. Invalidate map container size on layout transition (Full Width vs Split View)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [isSplitMode, forceFullWidth]);

  // Handlers for switching between tickets in Split View
  const handleSelectTicket = (ticket) => {
    setSelectedTicketId(ticket.id);
    setForceFullWidth(false);
    if (onSelectGrievance) onSelectGrievance(ticket);
  };

  const handleNextTicket = () => {
    if (!mappedGrievances.length) return;
    const currentIdx = mappedGrievances.findIndex((g) => g.id === activeTicket?.id);
    const nextIdx = (currentIdx + 1) % mappedGrievances.length;
    handleSelectTicket(mappedGrievances[nextIdx]);
  };

  const handlePrevTicket = () => {
    if (!mappedGrievances.length) return;
    const currentIdx = mappedGrievances.findIndex((g) => g.id === activeTicket?.id);
    const prevIdx = (currentIdx - 1 + mappedGrievances.length) % mappedGrievances.length;
    handleSelectTicket(mappedGrievances[prevIdx]);
  };

  const resetToBangaloreCenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([BENGALURU_CENTER.lat, BENGALURU_CENTER.lon], 12, { duration: 0.6 });
    }
  };

  return (
    <div className="admin-table-card animate-fade-in" style={{ padding: '20px', width: '100%', boxSizing: 'border-box' }}>
      {/* ========================================================================= */}
      {/* HEADER & SUMMARY CONTROLS                                                */}
      {/* ========================================================================= */}
      <div className="table-header-controls" style={{ marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.35rem' }}>
              <MapPin size={22} style={{ color: 'var(--brand-700)' }} />
              {t('Bengaluru Geospatial Grievance GIS') || 'Bengaluru Geospatial Grievance GIS'}
            </h2>
            <span
              className="badge"
              style={{
                backgroundColor: 'rgba(44, 87, 69, 0.12)',
                color: 'var(--brand-700)',
                fontWeight: 700,
                fontSize: '0.78rem'
              }}
            >
              {mappedGrievances.length} {t('Active Incident Pins') || 'Active Incident Pins'}
            </span>
            {urgentCountInView > 0 && (
              <span className="badge badge-urgent" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={12} /> {urgentCountInView} Urgent Breaches
              </span>
            )}
          </div>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            {t('Real-time geographic distribution of citizen complaints across Bengaluru wards. Filter by department or toggle satellite view.')}
          </p>
        </div>

        {/* Global Controls: Search & Show Resolved */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder={t('Search address, ward, or ID...') || 'Search address, ward, or ID...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="filter-select"
              style={{ paddingLeft: '30px', width: '100%', height: '34px', fontSize: '0.82rem' }}
            />
          </div>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={includeResolved}
              onChange={(e) => setIncludeResolved(e.target.checked)}
              style={{ accentColor: 'var(--brand-700)' }}
            />
            {t('Show Resolved') || 'Show Resolved'}
          </label>

          <button
            type="button"
            onClick={resetToBangaloreCenter}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}
            title={t('Center map on Vidhana Soudha / Central Bengaluru')}
          >
            <Compass size={14} /> {t('Center Map') || 'Center Map'}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. DYNAMIC DEPARTMENT FILTER BUTTONS (Roads, Water, Waste, Electric, etc)  */}
      {/* ========================================================================= */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={13} /> {t('Filter Grievances by Department') || 'Filter Grievances by Department'}:
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {CORE_DEPT_FILTERS.map((dept) => {
            const Icon = dept.icon;
            const count = deptCounts[dept.id] || 0;
            const isActive = activeDept === dept.id;

            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => {
                  setActiveDept(dept.id);
                  setSelectedTicketId(null);
                }}
                className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 14px',
                  borderRadius: '20px',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  border: isActive ? '2px solid var(--brand-700)' : '1px solid var(--border-subtle)',
                  background: isActive ? 'var(--brand-700)' : 'var(--bg-card)',
                  color: isActive ? '#ffffff' : 'var(--text-main)',
                  boxShadow: isActive ? '0 2px 8px rgba(44, 87, 69, 0.25)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={15} style={{ color: isActive ? '#ffffff' : dept.color }} />
                <span>{dept.label}</span>
                <span
                  style={{
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'var(--bg-tertiary)',
                    color: isActive ? '#ffffff' : 'var(--text-main)',
                    padding: '1px 7px',
                    borderRadius: '10px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    marginLeft: '2px'
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Priority Secondary Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          {t('Priority') || 'Priority'}:
        </span>
        {['All', 'Urgent', 'High', 'Medium', 'Low'].map((pr) => {
          const isPrActive = priorityFilter === pr;
          return (
            <button
              key={pr}
              type="button"
              onClick={() => setPriorityFilter(pr)}
              style={{
                background: isPrActive ? 'var(--text-main)' : 'var(--bg-card)',
                color: isPrActive ? 'var(--bg-primary)' : 'var(--text-muted)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '2px 10px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {pr === 'Urgent' ? '🚨 Urgent' : pr === 'High' ? '🔥 High' : pr}
            </button>
          );
        })}

        <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {t('Selected Filter') || 'Selected Filter'}: <strong style={{ color: 'var(--brand-700)' }}>{activeFilterMeta.label}</strong>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DYNAMIC WORKSPACE: FULL BREADTH vs SPLIT INSPECTION MODE                */}
      {/* ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isSplitMode ? 'minmax(0, 1.35fr) minmax(360px, 1fr)' : '1fr',
          gap: '1.25rem',
          alignItems: 'start',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* LEFT PANE: REAL BENGALURU MAP WITH SATELLITE & HYBRID SWITCHER */}
        <div
          style={{
            position: 'relative',
            height: isSplitMode ? '620px' : '580px',
            width: '100%',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--border-subtle)',
            overflow: 'hidden',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Top Live Badge inside Map */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              zIndex: 400,
              backgroundColor: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(8px)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.76rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16a34a', display: 'inline-block' }} />
            <span>Bengaluru GIS • {activeFilterMeta.label} ({mappedGrievances.length} cases)</span>
          </div>

          {/* SATELLITE MAP MODE SELECTOR */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '54px',
              zIndex: 400,
              display: 'flex',
              backgroundColor: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(8px)',
              borderRadius: '8px',
              padding: '3px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
              border: '1px solid rgba(0,0,0,0.12)',
              gap: '2px'
            }}
          >
            <button
              type="button"
              onClick={() => setMapMode('hybrid')}
              style={{
                padding: '4px 10px',
                fontSize: '0.74rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: mapMode === 'hybrid' ? 'var(--brand-700)' : 'transparent',
                color: mapMode === 'hybrid' ? '#ffffff' : 'var(--text-main)',
                transition: 'all 0.15s ease'
              }}
              title="Satellite imagery with street network and landmark labels"
            >
              <Globe size={13} />
              <span>Hybrid</span>
            </button>

            <button
              type="button"
              onClick={() => setMapMode('satellite')}
              style={{
                padding: '4px 10px',
                fontSize: '0.74rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: mapMode === 'satellite' ? 'var(--brand-700)' : 'transparent',
                color: mapMode === 'satellite' ? '#ffffff' : 'var(--text-main)',
                transition: 'all 0.15s ease'
              }}
              title="High-resolution photorealistic satellite photography"
            >
              <Satellite size={13} />
              <span>Satellite</span>
            </button>

            <button
              type="button"
              onClick={() => setMapMode('streets')}
              style={{
                padding: '4px 10px',
                fontSize: '0.74rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: mapMode === 'streets' ? 'var(--brand-700)' : 'transparent',
                color: mapMode === 'streets' ? '#ffffff' : 'var(--text-main)',
                transition: 'all 0.15s ease'
              }}
              title="Clean municipal GIS vector street map"
            >
              <MapPin size={13} />
              <span>Streets</span>
            </button>
          </div>

          {/* Leaflet DOM Container */}
          <div
            ref={mapContainerRef}
            style={{
              width: '100%',
              height: '100%',
              flex: 1,
              backgroundColor: '#1e293b'
            }}
          />

          {/* Bottom Right Legend */}
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              zIndex: 400,
              backgroundColor: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(8px)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.72rem',
              display: 'flex',
              gap: '12px',
              color: 'var(--text-main)',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#dc2626' }} /> Urgent / Escalated
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ea580c' }} /> High Priority
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563EB' }} /> Standard
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16a34a' }} /> Resolved
            </span>
          </div>

          {/* Guidance Banner when in Full Breadth Mode */}
          {!isSplitMode && (
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                zIndex: 400,
                backgroundColor: 'rgba(44, 87, 69, 0.92)',
                color: '#ffffff',
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.76rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
              }}
            >
              <Crosshair size={14} />
              <span>{t('Click any pin across the city to inspect ticket details in split view.')}</span>
            </div>
          )}
        </div>

        {/* RIGHT PANE: RICH GRIEVANCE DETAIL INSPECTOR (APPEARS WHEN TICKET IS CLICKED) */}
        {isSplitMode && activeTicket && (
          <div
            className="card glass-card animate-fade-in"
            style={{
              padding: '20px',
              border: '2px solid var(--brand-700)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 8px 24px rgba(44, 87, 69, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              height: '620px',
              overflowY: 'auto',
              boxSizing: 'border-box'
            }}
          >
            {/* Inspector Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--brand-700)', letterSpacing: '0.04em' }}>
                    {activeTicket.id}
                  </span>
                  <span className={`priority-pill priority-${(activeTicket.priority || 'medium').toLowerCase()}`}>
                    {activeTicket.priority}
                  </span>
                  <span className={`badge badge-${(activeTicket.status || 'submitted').toLowerCase().replace(/\s+/g, '-')}`}>
                    {activeTicket.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Locality: <strong>{activeTicket.bangaloreCoords.locality}</strong> ({activeTicket.bangaloreCoords.ward})
                </div>
              </div>

              {/* Close Button to Restore Full-Breadth Map */}
              <button
                type="button"
                onClick={() => setSelectedTicketId(null)}
                className="btn btn-secondary btn-sm"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  fontWeight: 700,
                  fontSize: '0.76rem',
                  color: 'var(--text-muted)'
                }}
                title={t('Close details and expand map to full breadth')}
              >
                <X size={14} /> {t('Full Map') || 'Full Map'}
              </button>
            </div>

            {/* Grievance Title */}
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.15rem', color: 'var(--text-main)', lineHeight: 1.35 }}>
              {activeTicket.title}
            </h3>

            {/* Bangalore Ward & Geo Coordinates Strip */}
            <div
              style={{
                backgroundColor: 'var(--bg-primary)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                fontSize: '0.82rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={15} style={{ color: 'var(--brand-700)', flexShrink: 0 }} />
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                  {activeTicket.location}
                </span>
                {activeTicket.landmark && (
                  <span style={{ color: 'var(--text-muted)' }}>
                    (near {activeTicket.landmark})
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.76rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                <span><strong>BBMP Zone:</strong> {activeTicket.bangaloreCoords.zone}</span>
                <span><strong>Coordinates:</strong> {activeTicket.bangaloreCoords.lat.toFixed(4)}° N, {activeTicket.bangaloreCoords.lon.toFixed(4)}° E</span>
              </div>
            </div>

            {/* Department & Officer Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px', fontSize: '0.82rem' }}>
              <div style={{ backgroundColor: 'var(--bg-card)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>
                  <Building2 size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {t('Department')}
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{activeTicket.department}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{activeTicket.category}</div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-card)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>
                  <UserCheck size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {t('Assigned Officer')}
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {activeTicket.assignedOfficer || t('Pending Dispatch')}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {activeTicket.assignedOfficerContact || '+91 94481 11001'}
                </div>
              </div>
            </div>

            {/* Complaint Description */}
            <div style={{ marginBottom: '14px', flex: 1 }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                {t('Citizen Complaint Description')}:
              </div>
              <div
                style={{
                  backgroundColor: 'var(--bg-card)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.84rem',
                  color: 'var(--text-main)',
                  lineHeight: 1.5,
                  maxHeight: '130px',
                  overflowY: 'auto'
                }}
              >
                {activeTicket.description || t('No extended description provided.')}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {onOpenAction && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => onOpenAction(activeTicket)}
                  style={{ flex: 1, justifyContent: 'center', padding: '9px 14px' }}
                >
                  <Edit3 size={15} /> {t('Update & Route Ticket')}
                </button>
              )}
              {onClaimGrievance && user?.role === 'OFFICER' && activeTicket.assignedOfficer !== user?.fullName && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => onClaimGrievance(activeTicket.id)}
                  style={{ justifyContent: 'center', padding: '9px 14px' }}
                >
                  <Hand size={15} /> {t('Claim Ticket')}
                </button>
              )}
              {activeTicket.ipfsDocumentCid && (
                <a
                  href={`http://localhost:5000/api/ipfs/${activeTicket.ipfsDocumentCid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <ExternalLink size={14} /> IPFS Proof
                </a>
              )}
            </div>

            {/* Bottom Navigation Between Mapped Tickets */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
              <button
                type="button"
                onClick={handlePrevTicket}
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.76rem' }}
              >
                <ChevronLeft size={14} /> {t('Previous Ticket')}
              </button>

              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                {mappedGrievances.findIndex((g) => g.id === activeTicket.id) + 1} of {mappedGrievances.length}
              </span>

              <button
                type="button"
                onClick={handleNextTicket}
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.76rem' }}
              >
                {t('Next Ticket')} <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. BOTTOM QUICK-ACCESS GRIEVANCE CAROUSEL / STRIP                         */}
      {/* ========================================================================= */}
      <div style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h4 style={{ margin: 0, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={14} /> {t('Grievance Incident Queue in View')} ({mappedGrievances.length})
          </h4>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            {t('Click any item to highlight on Bangalore map & open details')}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '8px',
            scrollbarWidth: 'thin'
          }}
        >
          {mappedGrievances.map((item, i) => {
            const isItemActive = activeTicket?.id === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTicket(item)}
                style={{
                  minWidth: '260px',
                  maxWidth: '300px',
                  textAlign: 'left',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: isItemActive ? '2px solid var(--brand-700)' : '1px solid var(--border-subtle)',
                  background: isItemActive ? 'var(--bg-tertiary)' : 'var(--bg-card)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  boxShadow: isItemActive ? '0 2px 8px rgba(44, 87, 69, 0.15)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--brand-700)' }}>
                    #{i + 1} {item.id}
                  </span>
                  <span className={`priority-pill priority-${(item.priority || 'medium').toLowerCase()}`} style={{ fontSize: '0.64rem' }}>
                    {item.priority}
                  </span>
                </div>

                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '3px' }}>
                  {item.title}
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  📍 {item.bangaloreCoords.locality} • {item.department}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
