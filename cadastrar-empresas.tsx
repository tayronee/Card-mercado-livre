import { useEffect, useMemo, useState } from "react";

// Util: simple CNPJ validator (mod 11)
function onlyDigits(v) {
  return (v || "").replace(/\D+/g, "");
}

function isValidCNPJ(cnpj) {
  cnpj = onlyDigits(cnpj);
  if (!cnpj || cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false; // all same digits

  const calcCheck = (base) => {
    let size = base.length;
    let numbers = base.split("");
    let sum = 0;
    let pos = size - 7;
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers[size - i], 10) * pos--;
      if (pos < 2) pos = 9;
    }
    const result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return String(result);
  };

  const base12 = cnpj.substring(0, 12);
  const d1 = calcCheck(base12);
  const d2 = calcCheck(base12 + d1);
  return cnpj.endsWith(d1 + d2);
}

function formatCNPJ(v) {
  const d = onlyDigits(v).slice(0, 14);
  return d
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function formatPhone(v) {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  }
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
}

function formatCEP(v) {
  const d = onlyDigits(v).slice(0, 8);
  return d.replace(/(\d{5})(\d{0,3})/, "$1-$2");
}

const initialData = {
  companyName: "",
  tradeName: "",
  cnpj: "",
  email: "",
  phone: "",
  website: "",
  founded: "",
  size: "",
  industry: "",
  notes: "",
  address: {
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    cep: "",
  },
  acceptTerms: false,
};

export default function CompanyRegistrationForm() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem("company-form");
      return saved ? JSON.parse(saved) : initialData;
    } catch {
      return initialData;
    }
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    localStorage.setItem("company-form", JSON.stringify(data));
  }, [data]);

  const cnpjOk = useMemo(() => (data.cnpj ? isValidCNPJ(data.cnpj) : true), [data.cnpj]);

  function setField(path, value) {
    setData((prev) => {
      const copy = structuredClone(prev);
      const parts = path.split(".");
      let ref = copy;
      for (let i = 0; i < parts.length - 1; i++) ref = ref[parts[i]];
      ref[parts.at(-1)] = value;
      return copy;
    });
  }

  function validate() {
    const e = {};
    if (!data.companyName?.trim()) e.companyName = "Informe o nome da empresa";
    if (!data.tradeName?.trim()) e.tradeName = "Informe o nome fantasia";
    if (!data.cnpj?.trim() || !isValidCNPJ(data.cnpj)) e.cnpj = "CNPJ inválido";
    if (!data.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "E-mail inválido";
    if (!data.phone || onlyDigits(data.phone).length < 10) e.phone = "Telefone inválido";
    if (data.website && !/^https?:\/\//i.test(data.website)) e.website = "Use http(s)://";
    if (!data.address.city?.trim()) e.city = "Informe a cidade";
    if (!data.address.state?.trim()) e.state = "Informe o estado";
    if (onlyDigits(data.address.cep).length !== 8) e.cep = "CEP inválido";
    if (!data.acceptTerms) e.acceptTerms = "É necessário aceitar os termos";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    setSubmitted(true);
    if (!validate()) return;

    // Simule um envio para API
    const payload = {
      ...data,
      cnpj: onlyDigits(data.cnpj),
      phone: onlyDigits(data.phone),
      address: { ...data.address, cep: onlyDigits(data.address.cep) },
    };

    console.log("ENVIANDO PARA API:", payload);
    alert("Cadastro enviado! Verifique o console para ver o paylo
