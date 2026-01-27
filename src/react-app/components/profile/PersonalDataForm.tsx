
import { useState, useEffect } from "react";
import { useFinanceStore } from "@/react-app/contexts/FinanceContext";
import {
    validateCPF, formatCPF, validateEmail, validatePhone, formatPhone,
    validateZipCode, formatZipCode, fetchAddressByZipCode
} from "@/shared/utils";
import { Save, Loader2, Search } from "lucide-react";
import type { PersonalInfo, ContactInfo, Address } from "@/shared/types";

export function PersonalDataForm() {
    const {
        user,
        updateUser,
        updatePersonalInfo,
        updateContactInfo,
        updateAddress,
        ensureUser
    } = useFinanceStore();

    const [isLoading, setIsLoading] = useState(false);
    const [addressLoading, setAddressLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [successMessage, setSuccessMessage] = useState("");

    // Local state for form fields to handle inputs before saving
    const [formData, setFormData] = useState<{
        personalInfo: PersonalInfo;
        contactInfo: ContactInfo;
        address: Address;
    }>({
        personalInfo: { fullName: "", cpf: "" },
        contactInfo: { email: "", emailVerified: false, phone: "", phoneVerified: false },
        address: { zipCode: "", street: "", number: "", neighborhood: "", city: "", state: "", country: "Brasil" }
    });

    // Load user data on mount
    useEffect(() => {
        if (user) {
            setFormData({
                personalInfo: user.personalInfo,
                contactInfo: user.contactInfo,
                address: user.address
            });
        }
    }, [user]);

    const handleChange = (section: keyof typeof formData, field: string, value: string) => {
        let formattedValue = value;

        // Auto-formatting
        if (field === 'cpf') formattedValue = formatCPF(value);
        if (field === 'phone') formattedValue = formatPhone(value);
        if (field === 'zipCode') formattedValue = formatZipCode(value);

        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: formattedValue
            }
        }));

        // Clear error when user types
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleZipCodeBlur = async () => {
        const zip = formData.address.zipCode;
        if (!validateZipCode(zip)) return;

        setAddressLoading(true);
        const address = await fetchAddressByZipCode(zip);
        setAddressLoading(false);

        if (address) {
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    ...address
                }
            }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Personal Info
        if (formData.personalInfo.fullName.length < 3) newErrors.fullName = "Nome muito curto";
        if (formData.personalInfo.cpf && !validateCPF(formData.personalInfo.cpf)) newErrors.cpf = "CPF inválido";

        // Contact
        if (!validateEmail(formData.contactInfo.email)) newErrors.email = "E-mail inválido";
        if (!validatePhone(formData.contactInfo.phone)) newErrors.phone = "Telefone inválido";

        // Address
        if (!validateZipCode(formData.address.zipCode)) newErrors.zipCode = "CEP inválido";
        if (!formData.address.street) newErrors.street = "Rua obrigatória";
        if (!formData.address.number) newErrors.number = "Número obrigatório";
        if (!formData.address.neighborhood) newErrors.neighborhood = "Bairro obrigatório";
        if (!formData.address.city) newErrors.city = "Cidade obrigatória";
        if (!formData.address.state) newErrors.state = "Estado obrigatório";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);

        try {
            // Ensure Authentication
            const { contactInfo } = formData; // Use form data as source of truth for email
            const emailToUse = contactInfo.email || user?.contactInfo?.email;

            if (emailToUse) {
                const authId = await ensureUser(emailToUse);
                if (!authId) {
                    alert("Não foi possível autenticar o usuário. Verifique o email ou se já possui conta com outra senha.");
                    // Proceed locally anyway? No, warn.
                } else {
                    // Update current user locally with the real ID if it changed
                    if (user && user.id !== authId) {
                        // We might need to migrate local data or just reload?
                        // For MVP, just updating the ID in the store is tricky if referencing elsewhere.
                        // But updateUser handles it.
                    }
                }
            }

            // If user doesn't exist yet, create basic structure
            if (!user) {
                updateUser({
                    // Remove randomUUID, updateUser will handle getting ID from auth
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    personalInfo: formData.personalInfo,
                    contactInfo: formData.contactInfo,
                    address: formData.address,
                    settings: {
                        currency: 'BRL',
                        language: 'pt-BR',
                        timezone: 'America/Sao_Paulo',
                        notifications: { emailNotifications: true, pushNotifications: true, transactionAlerts: true, goalAlerts: true, insightAlerts: true },
                        privacy: { shareData: false, analyticsEnabled: true }
                    }
                });
            } else {
                updatePersonalInfo(formData.personalInfo);
                updateContactInfo(formData.contactInfo);
                updateAddress(formData.address);
            }

            setSuccessMessage("Dados salvos com sucesso!");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            console.error("Error saving profile:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">

            {/* 1. Dados Pessoais */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Dados Pessoais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                        <input
                            type="text"
                            value={formData.personalInfo.fullName}
                            onChange={(e) => handleChange('personalInfo', 'fullName', e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg border focus:ring-2 outline-none transition-all ${errors.fullName ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-200'}`}
                            placeholder="Seu nome completo"
                        />
                        {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                        <input
                            type="text"
                            value={formData.personalInfo.cpf || ""}
                            onChange={(e) => handleChange('personalInfo', 'cpf', e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg border focus:ring-2 outline-none transition-all ${errors.cpf ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-200'}`}
                            placeholder="000.000.000-00"
                            maxLength={14}
                        />
                        {errors.cpf && <p className="text-xs text-red-500 mt-1">{errors.cpf}</p>}
                    </div>
                </div>
            </div>

            {/* 2. Contato */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Contato</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                        <input
                            type="email"
                            value={formData.contactInfo.email}
                            onChange={(e) => handleChange('contactInfo', 'email', e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg border focus:ring-2 outline-none transition-all ${errors.email ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-200'}`}
                            placeholder="seu@email.com"
                        />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
                        <input
                            type="tel"
                            value={formData.contactInfo.phone}
                            onChange={(e) => handleChange('contactInfo', 'phone', e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg border focus:ring-2 outline-none transition-all ${errors.phone ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-200'}`}
                            placeholder="(00) 00000-0000"
                            maxLength={15}
                        />
                        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                    </div>
                </div>
            </div>

            {/* 3. Endereço */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Endereço</h2>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={formData.address.zipCode}
                                onChange={(e) => handleChange('address', 'zipCode', e.target.value)}
                                onBlur={handleZipCodeBlur}
                                className={`w-full pl-4 pr-10 py-2 rounded-lg border focus:ring-2 outline-none transition-all ${errors.zipCode ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-200'}`}
                                placeholder="00000-000"
                                maxLength={9}
                            />
                            <div className="absolute right-3 top-2.5 text-gray-400">
                                {addressLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                            </div>
                        </div>
                        {errors.zipCode && <p className="text-xs text-red-500 mt-1">{errors.zipCode}</p>}
                    </div>

                    <div className="md:col-span-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rua / Logradouro</label>
                        <input
                            type="text"
                            value={formData.address.street}
                            onChange={(e) => handleChange('address', 'street', e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg border focus:ring-2 outline-none transition-all ${errors.street ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-200'}`}
                        />
                        {errors.street && <p className="text-xs text-red-500 mt-1">{errors.street}</p>}
                    </div>

                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                        <input
                            type="text"
                            value={formData.address.number}
                            onChange={(e) => handleChange('address', 'number', e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg border focus:ring-2 outline-none transition-all ${errors.number ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-200'}`}
                        />
                        {errors.number && <p className="text-xs text-red-500 mt-1">{errors.number}</p>}
                    </div>

                    <div className="md:col-span-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                        <input
                            type="text"
                            value={formData.address.neighborhood}
                            onChange={(e) => handleChange('address', 'neighborhood', e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg border focus:ring-2 outline-none transition-all ${errors.neighborhood ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-200'}`}
                        />
                        {errors.neighborhood && <p className="text-xs text-red-500 mt-1">{errors.neighborhood}</p>}
                    </div>

                    <div className="md:col-span-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                        <input
                            type="text"
                            value={formData.address.city}
                            onChange={(e) => handleChange('address', 'city', e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg border focus:ring-2 outline-none transition-all ${errors.city ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-200'}`}
                        />
                        {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                    </div>

                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado (UF)</label>
                        <input
                            type="text"
                            value={formData.address.state}
                            onChange={(e) => handleChange('address', 'state', e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg border focus:ring-2 outline-none transition-all ${errors.state ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-200'}`}
                            maxLength={2}
                        />
                        {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-gray-100">
                {successMessage && (
                    <span className="text-emerald-600 font-medium animate-fade-in">
                        {successMessage}
                    </span>
                )}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    Salvar Alterações
                </button>
            </div>

        </form>
    );
}
