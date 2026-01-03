import React from 'react';
import { X, Smartphone, Globe, LogOut } from 'lucide-react';
import { supabase } from '../../services/supabase';

interface DevicesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DevicesModal: React.FC<DevicesModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.reload();
    };

    // Get basic browser info
    const userAgent = navigator.userAgent;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
    const platform = isMobile ? 'Dispositivo Móvel' : 'Computador (Desktop)';

    // Simple browser detection
    let browserName = "Navegador Desconhecido";
    if (userAgent.indexOf("Firefox") > -1) {
        browserName = "Mozilla Firefox";
    } else if (userAgent.indexOf("SamsungBrowser") > -1) {
        browserName = "Samsung Internet";
    } else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
        browserName = "Opera";
    } else if (userAgent.indexOf("Trident") > -1) {
        browserName = "Microsoft Internet Explorer";
    } else if (userAgent.indexOf("Edge") > -1) {
        browserName = "Microsoft Edge";
    } else if (userAgent.indexOf("Chrome") > -1) {
        browserName = "Google Chrome";
    } else if (userAgent.indexOf("Safari") > -1) {
        browserName = "Apple Safari";
    }

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Smartphone size={20} className="text-indigo-600" />
                        Dispositivos Conectados
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                            {isMobile ? <Smartphone size={24} /> : <Globe size={24} />}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-slate-800">{platform}</h4>
                                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Atual</span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">{browserName}</p>
                            <p className="text-[10px] text-slate-400 mt-1 truncate max-w-[200px]">{userAgent}</p>
                        </div>
                    </div>

                    <p className="text-xs text-slate-400 text-center leading-relaxed px-4">
                        Por segurança, você pode encerrar esta sessão a qualquer momento. Isso desconectará sua conta neste dispositivo.
                    </p>

                    <button
                        onClick={handleLogout}
                        className="w-full py-4 bg-rose-50 text-rose-600 font-bold rounded-2xl hover:bg-rose-100 transition-all border border-rose-100 flex items-center justify-center gap-2"
                    >
                        <LogOut size={18} />
                        Sair desta conta
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DevicesModal;
