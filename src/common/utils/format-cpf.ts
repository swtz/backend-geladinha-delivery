export function formatCpf(cpf: string) {
  const cleaned = cleanCpf(cpf);
  return buildCpf(cleaned);
}

function cleanCpf(cpf: string) {
  return cpf.replace(/\D/g, '');
}

function buildCpf(cpf: string) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, '$1.$2.$3-$4');
}

export function validateCpf(cpf: string) {
  const final = cpf.match(/(?:\d{3}[.-\s]?){3}\d{2}/g);
  const isValid = final && final[0] === cpf;
  return !!isValid;
}
