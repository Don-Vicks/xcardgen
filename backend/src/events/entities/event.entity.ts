export class Event {
  id: string;
  userId: string;
  workspaceId: string;
  name: string;
  description: string;
  templateId: string;
  status: string;
  properties?: any;
  createdAt: Date;
  updatedAt: Date;
}
