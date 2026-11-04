import React, { useState, useEffect } from 'react';
import { User, Building, Mail, Phone, MapPin, GraduationCap, Award, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ResearcherProfile } from '../../types';
import { getResearcherProfile, saveResearcherProfile, saveUserAccount } from '../../firebase/services';

export const ResearcherProfileView: React.FC = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<ResearcherProfile | null>(null);
  const [contactNumber, setContactNumber] = useState('');
  const [institution, setInstitution] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [education, setEducation] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [address, setAddress] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      if (!currentUser) return;
      const p = await getResearcherProfile(currentUser.id);
      if (p) {
        setProfile(p);
        setContactNumber(p.contact_number || '');
        setInstitution(p.institution || currentUser.institution || '');
        setDepartment(p.department || currentUser.department || '');
        setPosition(p.position || '');
        setEducation(p.educational_background || '');
        setSpecialization(p.specialization || '');
        setAddress(p.address || '');
      } else {
        setInstitution(currentUser.institution || 'University of the Philippines Diliman');
        setDepartment(currentUser.department || 'Department of Computer Science');
        setPosition('Professor / Senior Researcher');
        setContactNumber('+63 917 555 0192');
      }
    }
    load();
  }, [currentUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSaving(true);
    setSavedSuccess(false);

    const updatedProfile: ResearcherProfile = {
      id: profile?.id || currentUser.id,
      user_id: currentUser.id,
      contact_number: contactNumber,
      institution,
      department,
      position,
      educational_background: education,
      specialization,
      address,
      updated_at: new Date().toISOString(),
    };

    await saveResearcherProfile(updatedProfile);
    setProfile(updatedProfile);

    // Also update current user account institution
    await saveUserAccount({
      ...currentUser,
      institution,
      department,
      updated_at: new Date().toISOString(),
    });

    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-gray-200 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#153B65]">Researcher Profile & Accreditation</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Institutional credentials and scientific specialization registered in Cloud Firestore.
          </p>
        </div>
        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-200 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Profile Saved
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-6 space-y-6">
        {/* Basic user info readonly */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-gray-200">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Full Legal Name
            </label>
            <p className="font-bold text-sm text-[#153B65] flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              {currentUser?.full_name}
            </p>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Accredited Institutional Email
            </label>
            <p className="font-mono text-xs text-gray-800 flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              {currentUser?.email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Contact Telephone / Mobile <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="+63 9XX XXX XXXX"
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#153B65]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Academic / Official Position
            </label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="e.g. Professor, Research Center Director, Dean"
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#153B65]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Implementing Institution / University <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. University of the Philippines Diliman"
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#153B65]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Department / Faculty / Laboratory
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Dept of Computer Science & AI Lab"
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#153B65]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Institutional Physical Address
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Diliman Campus, Quezon City 1101, Metro Manila"
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#153B65]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Educational Background & Degrees
          </label>
          <div className="relative">
            <GraduationCap className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <textarea
              rows={2}
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="e.g. Ph.D. in Computer Science (Carnegie Mellon), M.S. Computer Science (UP Diliman)"
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#153B65]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Primary Research Specialization & Priority Areas
          </label>
          <div className="relative">
            <Award className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <textarea
              rows={2}
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="e.g. Edge AI, Microgrid Telemetry, Climate Disaster Sensor Networks"
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#153B65]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-[#153B65] hover:bg-[#2563A6] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Updating Firestore...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
