'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateUserProfile, deleteUserData } from '@/lib/firestore';
import { fileToBase64 } from '@/lib/utils';
import { Trash2, Plus, Upload, Save, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SettingsPage() {
  const { user, userProfile, logout, refreshProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  
  // Nouveaux états pour la création d'entreprise
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyAddress, setNewCompanyAddress] = useState('');
  const [newCompanyCurrency, setNewCompanyCurrency] = useState('USD');
  const [newCompanyLogo, setNewCompanyLogo] = useState<File | null>(null);

  const handleUpdateProfile = async () => {
    if (!user || !userProfile) return;
    setLoading(true);
    try {
      await updateUserProfile(user.uid, { displayName });
      await refreshProfile();
      toast.success('Profil mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userProfile) return;
    
    if (!newCompanyName.trim()) {
      toast.error('Le nom de l\'entreprise est requis');
      return;
    }

    setLoading(true);
    try {
      let logoUrl = undefined;
      if (newCompanyLogo) {
        if (newCompanyLogo.size > 500 * 1024) {
          toast.error("L'image est trop volumineuse (max 500 KB)");
          setLoading(false);
          return;
        }
        logoUrl = await fileToBase64(newCompanyLogo);
      }

      const newCompany = {
        id: crypto.randomUUID(),
        name: newCompanyName,
        address: newCompanyAddress,
        currency: newCompanyCurrency,
        ...(logoUrl ? { logoUrl } : {})
      };

      const updatedCompanies = [...(userProfile.companies || []), newCompany];
      
      await updateUserProfile(user.uid, { 
        companies: updatedCompanies,
        companyName: '', // Efface la donnée legacy pour éviter les doublons fantômes
      });
      await refreshProfile();
      
      setNewCompanyName('');
      setNewCompanyAddress('');
      setNewCompanyCurrency('USD');
      setNewCompanyLogo(null);
      setShowAddCompany(false);
      
      toast.success('Entreprise ajoutée');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de l\'entreprise');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    if (!user || !userProfile || !userProfile.companies) return;
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette entreprise ?')) return;

    setLoading(true);
    try {
      const updatedCompanies = userProfile.companies.filter(c => c.id !== companyId);
      await updateUserProfile(user.uid, { 
        companies: updatedCompanies,
        companyName: '', // Efface la donnée legacy si on supprime
      });
      await refreshProfile();
      toast.success('Entreprise supprimée');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    const confirmDelete = window.prompt(
      'ATTENTION : Cette action supprimera définitivement votre compte et toutes vos factures.\n\nTapez "SUPPRIMER" pour confirmer :'
    );
    
    if (confirmDelete === 'SUPPRIMER') {
      setLoading(true);
      try {
        await deleteUserData(user.uid);
        await user.delete(); // Firebase Auth
        await logout();
        toast.success('Compte supprimé avec succès');
        router.push('/');
      } catch (error: any) {
        console.error(error);
        if (error.code === 'auth/requires-recent-login') {
          toast.error('Veuillez vous déconnecter et vous reconnecter avant de supprimer votre compte.');
        } else {
          toast.error('Erreur lors de la suppression du compte');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Paramètres</h1>
        <p className="text-slate-400">Gérez votre profil et vos entreprises</p>
      </div>

      {/* Profil */}
      <div className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl">
        <h2 className="text-xl font-semibold text-white mb-6">Mon Profil</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Email</label>
            <input
              type="text"
              value={userProfile?.email || ''}
              disabled
              className="w-full px-4 py-3 rounded-xl bg-slate-800/30 border border-white/5 text-slate-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Nom complet</label>
            <div className="flex gap-4">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
              <button
                onClick={handleUpdateProfile}
                disabled={loading || displayName === userProfile?.displayName}
                className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Entreprises */}
      <div className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Mes Entreprises</h2>
          {!showAddCompany && (
            <button
              onClick={() => setShowAddCompany(true)}
              className="flex items-center gap-2 px-4 py-2 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 rounded-xl transition-all text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
          )}
        </div>

        {/* Liste des entreprises existantes */}
        {userProfile?.companies && userProfile.companies.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {userProfile.companies.map(company => (
              <div key={company.id} className="p-4 rounded-xl border border-white/10 bg-slate-800/30 relative group">
                <button
                  onClick={() => handleDeleteCompany(company.id)}
                  className="absolute top-4 right-4 p-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all bg-slate-900/50 rounded-lg"
                  title="Supprimer l'entreprise"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-4">
                  {company.logoUrl ? (
                    <Image src={company.logoUrl} alt="Logo" width={48} height={48} className="rounded-lg object-contain bg-white/5" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 font-bold text-xl">
                      {company.name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-white">{company.name || 'Entreprise sans nom'}</h3>
                    {company.address && <p className="text-sm text-slate-400 mt-0.5">{company.address}</p>}
                    <p className="text-xs text-violet-400 mt-1 font-medium bg-violet-500/10 inline-block px-2 py-0.5 rounded">Devise: {company.currency}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Formulaire d'ajout */}
        {showAddCompany && (
          <form onSubmit={handleAddCompany} className="p-6 rounded-xl border border-violet-500/30 bg-violet-500/5 space-y-4">
            <h3 className="font-semibold text-white mb-4">Nouvelle entreprise</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Nom de l'entreprise *</label>
                <input
                  type="text"
                  required
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Devise</label>
                <select
                  value={newCompanyCurrency}
                  onChange={(e) => setNewCompanyCurrency(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 appearance-none"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="XOF">XOF (FCFA)</option>
                  <option value="MAD">MAD (MAD)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Adresse (Optionnel)</label>
              <input
                type="text"
                value={newCompanyAddress}
                onChange={(e) => setNewCompanyAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Logo (Optionnel)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewCompanyLogo(e.target.files?.[0] || null)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-white/10 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-500/10 file:text-violet-400 hover:file:bg-violet-500/20 cursor-pointer"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddCompany(false)}
                className="px-4 py-2 text-slate-400 hover:text-white transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-all disabled:opacity-50"
              >
                Ajouter l'entreprise
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Zone Danger */}
      <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-2xl">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-500/10 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white mb-2">Zone de danger</h2>
            <p className="text-slate-400 mb-6 text-sm">
              La suppression de votre compte est irréversible. Toutes vos factures, données d'entreprise et paramètres seront définitivement effacés de nos serveurs.
            </p>
            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/30 rounded-xl font-medium transition-all disabled:opacity-50"
            >
              Supprimer mon compte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
