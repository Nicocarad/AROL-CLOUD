export default interface MachineryFilters {
  models?: { [key: string]: boolean };
  types?: { [key: string]: boolean };
  numHeads?: {
    min: number;
    max: number;
  };
  numDashboards?: {
    min: number;
    max: number;
  };
  numDocuments?: {
    min: number;
    max: number;
  };
}
