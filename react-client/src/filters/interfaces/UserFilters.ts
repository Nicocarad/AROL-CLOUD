export default interface UserFilters {
  status?: string;
  creationDate?: {
    startDate: string;
    endDate: string;
  };
  roles?: { [key: string]: boolean };
}
