export function formatCnpj(cnpj: string) {
  const cleaned = cleanCnpj(cnpj);
  return buildCnpj(cleaned);
}

function cleanCnpj(cnpj: string) {
  return cnpj.replace(/\D/g, '');
}

function buildCnpj(cnpj: string) {
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g, '$1.$2.$3/$4-$5');
}

export function validateCnpj(cnpj: string) {
  const final = cnpj.match(
    /\d{2}[-.\s]?(?:\d{3}[-.\s]?){2}\/?\d{4}[-.\s]?\d{2}/g,
  );
  const isValid = final && final[0] === cnpj;
  return !!isValid;
}
