import pgClient from "../configs/PgClient";
import Company from "../entities/Company";

/* RETRIVE */

async function getCompanyByID(companyID: number): Promise<Company | null> {
  try {
    const result = await pgClient.oneOrNone("SELECT * FROM public.companies_catalogue WHERE id=$1", companyID);

    if (result) return new Company(result.id, result.name, result.city);
    else return null;
  } catch (e) {
    return null;
  }
}

async function getCompanies(): Promise<Company[] | null> {
  try {
    const result = await pgClient.manyOrNone("SELECT * FROM public.companies_catalogue");

    if (result) return result.map((row: any) => new Company(row.id, row.name, row.city));

    return null;
  } catch (e) {
    return null;
  }
}

/* CREATE */

async function createCompany(name: string, city: string): Promise<Company | null> {
  try {
    const result = await pgClient.oneOrNone(
      "INSERT INTO public.companies_catalogue(name, city) VALUES($1, $2) RETURNING *",
      [name, city],
    );

    if (result) return new Company(result.id, result.name, result.city);

    return null;
  } catch (e) {
    return null;
  }
}

/* UPDATE */

async function updateCompany(id: number, name: string, city: string): Promise<boolean> {
  try {
    const result = await pgClient.result(
      "UPDATE public.companies_catalogue SET name=$1, city=$2 WHERE id=$3 RETURNING *",
      [name, city, id],
    );

    return result.rowCount > 0;
  } catch (e) {
    return false;
  }
}

/* DELETE */

async function deleteCompany(companyID: number): Promise<boolean> {
  try {
    const result = await pgClient.result("DELETE FROM public.companies_catalogue WHERE id=$1", companyID);

    return result.rowCount > 0;
  } catch (e) {
    return false;
  }
}

export default {
  getCompanyByID,
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
};
