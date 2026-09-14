export type UserRole = 'company' | 'operator';

export type RequestStatus =
  | 'receiving_proposals'
  | 'operator_selected'
  | 'collection_scheduled'
  | 'in_collection'
  | 'collection_done'
  | 'destination_confirmed';

export type ProposalStatus = 'sent' | 'accepted' | 'not_selected';
export type CollectionStatus = 'scheduled' | 'in_progress' | 'done' | 'destination_confirmed';

export interface WasteRequest {
  id: string;
  number: string;
  wasteType: string;
  wasteCategory: string;
  quantity: number;
  unit: string;
  condition: string;
  location: string;
  desiredDate: string;
  needsTransport: boolean;
  needsTreatment: string;
  desiredDestination: string;
  notes: string;
  status: RequestStatus;
  proposalCount: number;
  selectedOperatorId?: string;
  createdAt: string;
}

export interface Operator {
  id: string;
  name: string;
  type: string;
  specialties: string[];
  rating: number;
  distance: number;
  capacity: string;
  services: string[];
  serviceArea: string;
  description: string;
  materialsAccepted: string[];
}

export interface Proposal {
  id: string;
  requestId: string;
  operatorId: string;
  value: number;
  availableDate: string;
  availableTime: string;
  services: string[];
  notes: string;
  status: ProposalStatus;
}

export interface Collection {
  id: string;
  requestId: string;
  operatorId: string;
  scheduledDate: string;
  status: CollectionStatus;
}

export interface Destination {
  id: string;
  collectionId: string;
  destinationType: string;
  quantity: number;
  date: string;
  notes: string;
}

export interface Certificate {
  id: string;
  requestId: string;
  collectionId: string;
  validationCode: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  message: string;
  detail: string;
  type: 'proposal' | 'selection' | 'schedule' | 'collection' | 'destination';
  requestId: string;
  read: boolean;
  createdAt: string;
}

export interface ImpactData {
  totalKg: number;
  co2eAvoided: number;
  operationsCount: number;
  materialsRecovered: number;
}
