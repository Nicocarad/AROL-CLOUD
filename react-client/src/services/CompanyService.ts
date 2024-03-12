import Company from "../companies/interfaces/Company";
import axios from "../utils/AxiosInterceptor";

/* RETRIVE */

// [CLIENT] -- Get all companies
async function getCompanies() {
  const response = await axios.get("/company/all/");
  if (response.status === 200) return response.data;

  throw response.data;
}

// [CLIENT] -- Get company by ID
async function getCompanyByID(id: number) {
  const response = await axios.get("/company/" + id);
  if (response.status === 200) return response.data;

  throw response.data;
}

/* CREATE */

// [CLIENT] -- Create a new company
async function createCompany(company: Company) {
  const response = await axios.post("/company/create/", {
    name: company.name,
    city: company.city,
  });
  if (response.status === 200) return response.data;

  throw response.data;
}

/* UPDATE */

// [CLIENT] -- Update company details
async function updateCompany(company: Company) {
  const response = await axios.post("/company/update/", {
    id: company.id,
    name: company.name,
    city: company.city,
  });
  if (response.status === 200) return response.data;

  throw response.data;
}

/* DELETE */

// [CLIENT] -- Delete company
async function deleteCompany(id: number) {
  let response = await axios.delete("/company/" + id);
  if (response.status === 200) return response.data;

  throw response.data;
}

const companyService = {
  getCompanies,
  getCompanyByID,
  createCompany,
  updateCompany,
  deleteCompany,
};

export default companyService;
