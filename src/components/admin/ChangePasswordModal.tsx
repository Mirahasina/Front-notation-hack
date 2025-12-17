import { useState } from 'react';
import { Modal } from '../Modal';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ChangePasswordModal = ({ isOpen, onClose }: ChangePasswordModalProps) => {
    const { user } = useAuth();
    const { updateUser } = useData();

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = () => {
        setError('');

        if (!user) return;

        if (oldPassword !== user.password) {
            setError('L\'ancien mot de passe est incorrect');
            return;
        }

        if (newPassword.length < 4) {
            setError('Le nouveau mot de passe doit contenir au moins 4 caractères');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Les nouveaux mots de passe ne correspondent pas');
            return;
        }

        updateUser(user.id, { password: newPassword });
        setSuccess(true);
        setTimeout(() => {
            handleClose();
        }, 1500);
    };

    const handleClose = () => {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setSuccess(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Changer le mot de passe">
            {success ? (
                <div className="text-center py-8">
                    <h3 className="text-xl font-bold text-white mb-2">Mot de passe modifié !</h3>
                    <p className="text-slate-400">Vos identifiants ont été mis à jour.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-5">
                    <div className="form-group mb-0">
                        <label className="form-label">Ancien mot de passe</label>
                        <input
                            type="password"
                            value={oldPassword}
                            onChange={e => setOldPassword(e.target.value)}
                            className="input-base"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="form-group mb-0">
                        <label className="form-label">Nouveau mot de passe</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className="input-base"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="form-group mb-0">
                        <label className="form-label">Confirmer le nouveau mot de passe</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className="input-base"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-800">
                        <button onClick={handleClose} className="btn-secondary">
                            Annuler
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="btn-primary"
                            disabled={!oldPassword || !newPassword || !confirmPassword}
                        >
                            Changer le mot de passe
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
};
