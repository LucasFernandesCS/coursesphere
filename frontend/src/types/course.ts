export type Course = {
  id: string;
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    lessons: number;
  };
};
