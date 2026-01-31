import { EmergencyRequest, ResourceUnit, Severity, DisasterType, ResourceType, ResourceStatus } from '../types';
import { database } from './database';

export class DataService {
  private static REQUESTS_KEY = 'dpi4_requests';
  private static RESOURCES_KEY = 'dpi4_resources';

  static async saveData(requests: EmergencyRequest[], resources: ResourceUnit[]): Promise<void> {
    try {
      await database.saveRequests(requests);
      await database.saveResources(resources);
      // Fallback to localStorage
      localStorage.setItem(this.REQUESTS_KEY, JSON.stringify(requests));
      localStorage.setItem(this.RESOURCES_KEY, JSON.stringify(resources));
    } catch (error) {
      console.error('Failed to save to IndexedDB, using localStorage', error);
      localStorage.setItem(this.REQUESTS_KEY, JSON.stringify(requests));
      localStorage.setItem(this.RESOURCES_KEY, JSON.stringify(resources));
    }
  }

  static getRequests(): EmergencyRequest[] {
    try {
      const data = localStorage.getItem(this.REQUESTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading requests', error);
      return [];
    }
  }

  static getResources(): ResourceUnit[] {
    try {
      const data = localStorage.getItem(this.RESOURCES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading resources', error);
      return [];
    }
  }

  static generateMockAlert(): EmergencyRequest {
    const disasters = Object.values(DisasterType);
    const severities = Object.values(Severity);
    const resources = Object.values(ResourceType);
    
    const descriptions = [
      'Building collapse reported. Multiple casualties suspected.',
      'Severe flooding in residential area. Families trapped on rooftops.',
      'Gas leak detected. Immediate evacuation required.',
      'Wildfire spreading rapidly. Wind conditions worsening.',
      'Major traffic accident. Multiple vehicles involved.',
      'Earthquake aftershock felt. Structural damage assessment needed.',
      'Chemical spill on highway. Hazmat team required.',
      'Hurricane damage to power infrastructure. Mass outage.',
      'Landslide blocking main road. People isolated.',
      'Medical emergency in remote area. Air ambulance needed.'
    ];

    return {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      disasterType: disasters[Math.floor(Math.random() * disasters.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      location: {
        lat: 34.0522 + (Math.random() - 0.5) * 0.3,
        lng: -118.2437 + (Math.random() - 0.5) * 0.3
      },
      resourceNeeded: resources[Math.floor(Math.random() * resources.length)],
      timestamp: new Date().toISOString(),
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      status: 'Pending',
      priorityScore: 0,
      syncStatus: 'synced'
    };
  }
}
