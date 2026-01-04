
import React, { useState, useEffect } from 'react';
import { X, User, Save, Loader2, Upload, MapPin, Phone, Calendar, CreditCard } from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { supabase } from '../../services/supabase';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
    const { profile, updateProfile, refreshProfile } = useSubscription();
    const [fullName, setFullName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [cpf, setCpf] = useState('');
    const [phone, setPhone] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');

    // New state for file upload
    const [uploading, setUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '');
            setAvatarUrl(profile.avatar_url || '');
            setCpf(profile.cpf || '');
            setPhone(profile.phone || '');
            setBirthDate(profile.date_of_birth || '');
            setCity(profile.city || '');
            setState(profile.state || '');
        }
    }, [profile, isOpen]);

    if (!isOpen) return null;

    const handleUploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('Você deve selecionar uma imagem para fazer upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${profile?.id}.${fileExt}`; // Fixed filename per user ensures replacement
            const filePath = `${fileName}`;

            // Upload the file to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                throw uploadError;
            }

            // Get Public URL
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

            // Force cache bust to immediately show new image
            const publicUrlWithTimestamp = `${data.publicUrl}?t=${Date.now()}`;
            setAvatarUrl(publicUrlWithTimestamp);

        } catch (error: any) {
            console.error('Erro ao fazer upload do avatar:', error);
            alert(error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await updateProfile({
                full_name: fullName,
                avatar_url: avatarUrl,
                cpf: cpf || undefined,
                phone: phone || undefined,
                date_of_birth: birthDate || undefined,
                city: city || undefined,
                state: state || undefined
            });
            await refreshProfile();
            onClose();
        } catch (error: any) {
            console.error(error);
            alert(`Erro ao atualizar perfil: ${error.message || 'Erro desconhecido'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 pb-0 border-b border-transparent flex justify-between items-center bg-white flex-shrink-0">
                    <h2 className="text-2xl font-bold text-slate-800">Editar Perfil</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">

                    {/* Avatar Upload Section */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt="Avatar"
                                    className="w-24 h-24 rounded-full object-cover border-4 border-slate-50 shadow-md group-hover:opacity-90 transition-opacity"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border-4 border-slate-50 shadow-md">
                                    <User size={40} />
                                </div>
                            )}

                            <label
                                htmlFor="avatar-upload"
                                className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full shadow-lg cursor-pointer hover:bg-indigo-700 transition-colors"
                            >
                                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                            </label>
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleUploadAvatar}
                                className="hidden"
                                disabled={uploading}
                            />
                        </div>
                        <p className="text-xs text-slate-400 font-medium">Clique na câmera para alterar sua foto</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1 ml-1">Nome Completo</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Seu nome completo"
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold"
                            />
                            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 ml-1">CPF</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={cpf}
                                    onChange={(e) => setCpf(e.target.value)}
                                    placeholder="000.000.000-00"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                                />
                                <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 ml-1">Data de Nasc.</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                                />
                                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1 ml-1">Telefone</label>
                        <div className="relative">
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="(00) 00000-0000"
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                            />
                            <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 ml-1">Cidade</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="Sua cidade"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                                />
                                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 ml-1">Estado</label>
                            <input
                                type="text"
                                value={state}
                                onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))}
                                placeholder="UF"
                                maxLength={2}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading || uploading}
                            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200 active:scale-95 flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                            <span>{isLoading ? 'Salvando...' : 'Salvar Alterações'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
