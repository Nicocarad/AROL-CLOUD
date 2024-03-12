export default class User {
  id: number;
  email: string;
  name: string;
  surname: string;
  roles: string[];
  active: boolean;
  companyID: number | null;
  createdAt: number;
  createdBy: string;
  isTemp: boolean;

  constructor(
    id: number,
    email: string,
    name: string,
    surname: string,
    roles: string[],
    active: boolean,
    companyID: number | null,
    createdAt: number,
    createdBy: string,
    isTemp: boolean,
  ) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.surname = surname;
    this.roles = roles;
    this.active = active;
    this.companyID = companyID;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
    this.isTemp = isTemp;
  }
}
