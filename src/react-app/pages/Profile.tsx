
import { useState } from "react";
import { DashboardLayout } from "@/react-app/components/dashboard/DashboardLayout";
import { PersonalDataForm } from "@/react-app/components/profile/PersonalDataForm";
import { AccountsManager } from "@/react-app/components/profile/AccountsManager";
import { User, CreditCard } from "lucide-react";

export default function Profile() {
    const [activeTab, setActiveTab] = useState<'profile' | 'accounts'>('profile');

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto pb-20">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Área do Usuário</h1>
                    <p className="text-gray-500 mt-2">Gerencie seus dados pessoais e contas financeiras</p>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl w-fit mb-8">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all text-sm ${activeTab === 'profile'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }`}
                    >
                        <User className="w-4 h-4" />
                        Dados Cadastrais
                    </button>
                    <button
                        onClick={() => setActiveTab('accounts')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all text-sm ${activeTab === 'accounts'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }`}
                    >
                        <CreditCard className="w-4 h-4" />
                        Contas e Cartões
                    </button>
                </div>

                {/* Content */}
                <div className="animate-fade-in">
                    {activeTab === 'profile' ? (
                        <PersonalDataForm />
                    ) : (
                        <AccountsManager />
                    )}
                </div>

            </div>
        </DashboardLayout>
    );
}
