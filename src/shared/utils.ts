
import type { Invoice, Address } from './types';

// ===== VALIDAÇÕES =====

// Validar CPF
export const validateCPF = (cpf: string): boolean => {
    const cleanCPF = cpf.replace(/\D/g, '');

    if (cleanCPF.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleanCPF.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleanCPF.charAt(10))) return false;

    return true;
};

// Validar E-mail
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validar Telefone Brasileiro
export const validatePhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length === 10 || cleanPhone.length === 11;
};

// Validar CEP
export const validateZipCode = (zipCode: string): boolean => {
    const cleanZipCode = zipCode.replace(/\D/g, '');
    return cleanZipCode.length === 8;
};

// ===== FORMATAÇÕES =====

// Formatar CPF
export const formatCPF = (cpf: string): string => {
    const cleanCPF = cpf.replace(/\D/g, '');
    return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

// Formatar Telefone
export const formatPhone = (phone: string): string => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 11) {
        return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
};

// Formatar CEP
export const formatZipCode = (zipCode: string): string => {
    const cleanZipCode = zipCode.replace(/\D/g, '');
    return cleanZipCode.replace(/(\d{5})(\d{3})/, '$1-$2');
};

// Formatar Número de Conta
export const formatAccountNumber = (number: string, digit: string): string => {
    return `${number}-${digit}`;
};

// Mascarar Número de Cartão
export const maskCardNumber = (lastFourDigits: string): string => {
    return `**** **** **** ${lastFourDigits}`;
};

// ===== CÁLCULOS =====

// Calcular Limite Disponível do Cartão
export const calculateAvailableLimit = (creditLimit: number, usedLimit: number): number => {
    return Math.max(0, creditLimit - usedLimit);
};

// Calcular Percentual do Limite Usado
export const calculateLimitUsagePercentage = (usedLimit: number, creditLimit: number): number => {
    if (creditLimit === 0) return 0;
    return (usedLimit / creditLimit) * 100;
};

// Calcular Data de Fechamento da Fatura
export const calculateClosingDate = (referenceDate: Date, closingDay: number): Date => {
    const year = referenceDate.getFullYear();
    const month = referenceDate.getMonth();
    return new Date(year, month, closingDay);
};

// Calcular Data de Vencimento da Fatura
export const calculateDueDate = (closingDate: Date, daysAfterClosing: number): Date => {
    const dueDate = new Date(closingDate);
    dueDate.setDate(dueDate.getDate() + daysAfterClosing);
    return dueDate;
};

// Obter Status da Fatura
export const getInvoiceStatus = (invoice: Invoice): string => {
    const today = new Date();
    const dueDate = new Date(invoice.dueDate);

    if (invoice.remainingAmount <= 0) return 'paga';
    if (invoice.paidAmount > 0 && invoice.remainingAmount > 0) return 'paga_parcial';
    if (today > dueDate) return 'vencida';
    if (today > new Date(invoice.closingDate)) return 'fechada';
    return 'aberta';
};

// ===== INTEGRAÇÃO COM API VIACEP =====

// Buscar Endereço por CEP
export const fetchAddressByZipCode = async (zipCode: string): Promise<Partial<Address> | null> => {
    try {
        const cleanZipCode = zipCode.replace(/\D/g, '');
        const response = await fetch(`https://viacep.com.br/ws/${cleanZipCode}/json/`);

        if (!response.ok) return null;

        const data = await response.json();

        if (data.erro) return null;

        return {
            zipCode: formatZipCode(data.cep),
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf,
            country: 'Brasil',
        };
    } catch (error) {
        console.error('Error fetching address:', error);
        return null;
    }
};
