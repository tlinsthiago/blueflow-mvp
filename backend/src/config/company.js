export const defaultCompanySettings = {
  legalName: 'F TEC AUTOMAÇÃO',
  cnpj: '',
  addressLine: '',
  city: '',
  state: '',
  legalRepresentative: '',
  representativeCpf: '',
  phone: '',
  email: '',
};

export function buildCompanyProfile(settings = null) {
  const company = {
    ...defaultCompanySettings,
    ...(settings ?? {}),
  };

  return {
    ...company,
    tradeName: company.legalName || defaultCompanySettings.legalName,
    subtitle: 'Automação e manutenção hidráulica para condomínios',
    document: company.cnpj || '',
    address: [company.addressLine, company.city && company.state ? `${company.city}/${company.state}` : company.city || company.state]
      .filter(Boolean)
      .join(' - '),
  };
};
