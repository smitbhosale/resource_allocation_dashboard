import { EmergencyRequest, ResourceUnit, AllocationRecommendation, Severity } from '../types';

export function calculatePriorityScore(request: EmergencyRequest): number {
  let score = 0;
  const severityScores = { [Severity.LOW]: 10, [Severity.MEDIUM]: 25, [Severity.HIGH]: 40, [Severity.CRITICAL]: 50 };
  score += severityScores[request.severity] || 0;
  const hoursElapsed = (Date.now() - new Date(request.timestamp).getTime()) / (1000 * 60 * 60);
  score += Math.max(20 - hoursElapsed, 0);
  score += request.status === 'Pending' ? 20 : 0;
  score += Math.random() * 10;
  return Math.min(Math.round(score), 100);
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function getBestResource(request: EmergencyRequest, resources: ResourceUnit[]): AllocationRecommendation | null {
  const availableResources = resources.filter(r => r.type === request.resourceNeeded && r.status === 'Available');
  if (availableResources.length === 0) return null;
  const recommendations = availableResources.map(resource => {
    const distance = calculateDistance(request.location.lat, request.location.lng, resource.location.lat, resource.location.lng);
    return { resourceId: resource.id, distance: Math.round(distance * 10) / 10, score: Math.max(100 - distance * 10, 0), reason: `${distance.toFixed(1)}km away` };
  });
  recommendations.sort((a, b) => b.score - a.score);
  return recommendations[0];
}
