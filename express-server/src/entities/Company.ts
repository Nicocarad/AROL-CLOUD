export default class Company {
  id: number;
  name: string;
  city: string;

  constructor(id: number, name: string, city: string) {
    this.id = id;
    this.name = name;
    this.city = city;
  }
}
