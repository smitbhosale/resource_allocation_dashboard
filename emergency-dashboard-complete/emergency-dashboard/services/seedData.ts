import { EmergencyRequest, ResourceUnit, Severity, DisasterType, ResourceType, ResourceStatus, EmergencyArea } from '../types';
import { calculatePriorityScore } from './allocationEngine';

// Generate realistic emergency requests
export function generateSeedRequests(): EmergencyRequest[] {
  const requests: EmergencyRequest[] = [];
  const descriptions = {
    [DisasterType.FLOOD]: [
      'Severe flooding in residential area. Multiple families stranded on rooftops.',
      'Flash flood warning. Water level rising rapidly near metro station.',
      'River overflow threatening low-lying neighborhoods.',
      'Storm drain backup causing street flooding.',
      'Basement flooding in apartment complex. Power outage risk.'
    ],
    [DisasterType.EARTHQUAKE]: [
      'Major earthquake detected. Building structural assessment needed.',
      'Aftershock reported. Possible building collapse in old district.',
      'Seismic activity causing bridge instability.',
      'Earthquake damage to hospital infrastructure.',
      'Structural cracks in residential building after tremors.'
    ],
    [DisasterType.WILDFIRE]: [
      'Wildfire spreading rapidly due to strong winds.',
      'Forest fire threatening residential areas. Evacuation needed.',
      'Smoke inhalation risk in nearby neighborhoods.',
      'Wildfire jumped firebreak. Multiple structures at risk.',
      'Lightning-sparked fire in hills. Spreading toward town.'
    ],
    [DisasterType.HURRICANE]: [
      'Category 4 hurricane approaching coastline.',
      'Hurricane-force winds causing widespread damage.',
      'Storm surge flooding coastal communities.',
      'Hurricane aftermath: massive power outages.',
      'Tornado spawned by hurricane touching down.'
    ],
    [DisasterType.CHEMICAL_SPILL]: [
      'Hazardous chemical spill on main highway. Evacuation zone established.',
      'Industrial accident. Chemical leak detected.',
      'Gas leak in residential area. Immediate evacuation required.',
      'Toxic fumes spreading from factory incident.',
      'Chemical tanker overturned. Containment needed.'
    ],
    [DisasterType.OTHER]: [
      'Major traffic accident. Multiple vehicles involved.',
      'Building collapse. Search and rescue operation.',
      'Gas pipeline rupture. Area cordoned off.',
      'Train derailment. Hazmat team required.',
      'Explosion at construction site. Multiple casualties.'
    ]
  };

  const severities = [Severity.LOW, Severity.MEDIUM, Severity.HIGH, Severity.CRITICAL];
  const resourceTypes = Object.values(ResourceType);
  const disasters = Object.values(DisasterType);
  
  // Generate 120 requests over the past 30 days
  for (let i = 0; i < 120; i++) {
    const disasterType = disasters[Math.floor(Math.random() * disasters.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const resourceNeeded = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
    
    // Random timestamp within last 30 days
    const daysAgo = Math.random() * 30;
    const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    
    // Location within a realistic area (LA area coordinates)
    const lat = 34.0522 + (Math.random() - 0.5) * 0.5;
    const lng = -118.2437 + (Math.random() - 0.5) * 0.5;
    
    // Status based on age
    let status: 'Pending' | 'Allocated' | 'Resolved' = 'Resolved';
    if (daysAgo < 0.1) status = 'Pending';  // Recent ones pending
    else if (daysAgo < 1) status = Math.random() > 0.5 ? 'Allocated' : 'Resolved';
    
    const descArray = descriptions[disasterType];
    const description = descArray[Math.floor(Math.random() * descArray.length)];
    
    const request: EmergencyRequest = {
      id: `REQ-${1000 + i}`,
      disasterType,
      severity,
      location: { lat, lng },
      resourceNeeded,
      timestamp: timestamp.toISOString(),
      description,
      status,
      priorityScore: 0,
      syncStatus: 'synced',
      areaId: `Z-0${Math.floor(Math.random() * 5) + 1}`
    };
    
    request.priorityScore = calculatePriorityScore(request);
    requests.push(request);
  }
  
  return requests.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// Generate resource units
export function generateSeedResources(): ResourceUnit[] {
  const resources: ResourceUnit[] = [];
  
  const ambulanceNames = ['Metro Ambulance 1', 'City EMS Unit', 'County Paramedic Van', 'Emergency Response Alpha', 'Medical Transport Beta'];
  const medicalNames = ['City Hospital Team A', 'Trauma Unit Mobile', 'Field Medical Station', 'Emergency Care Squad', 'Rapid Response Medics'];
  const rescueNames = ['Fire Department Rescue 1', 'USAR Team Alpha', 'Mountain Rescue Unit', 'Water Rescue Squad', 'Heavy Rescue Team'];
  const foodNames = ['Red Cross Relief Hub', 'Community Food Bank', 'Emergency Shelter Supplies', 'Disaster Relief Warehouse', 'Mobile Kitchen Unit'];
  
  const resourceConfigs = [
    { type: ResourceType.AMBULANCE, names: ambulanceNames, quantity: 1, count: 15 },
    { type: ResourceType.MEDICAL_TEAM, names: medicalNames, quantity: 1, count: 12 },
    { type: ResourceType.RESCUE_UNIT, names: rescueNames, quantity: 1, count: 10 },
    { type: ResourceType.FOOD_SUPPLY, names: foodNames, quantity: 1000, count: 8 }
  ];
  
  let id = 1;
  resourceConfigs.forEach(config => {
    for (let i = 0; i < config.count; i++) {
      const statusRoll = Math.random();
      let status: ResourceStatus;
      if (statusRoll < 0.6) status = ResourceStatus.AVAILABLE;
      else if (statusRoll < 0.85) status = ResourceStatus.IN_USE;
      else status = ResourceStatus.MAINTENANCE;
      
      resources.push({
        id: `RES-${String(id).padStart(3, '0')}`,
        name: `${config.names[i % config.names.length]} ${Math.floor(i / config.names.length) + 1}`,
        type: config.type,
        quantity: config.quantity,
        status,
        location: {
          lat: 34.0522 + (Math.random() - 0.5) * 0.6,
          lng: -118.2437 + (Math.random() - 0.5) * 0.6
        }
      });
      id++;
    }
  });
  
  return resources;
}

// Initialize database with seed data
export function initializeSeedData() {
  const requests = generateSeedRequests();
  const resources = generateSeedResources();
  
  return { requests, resources };
}
