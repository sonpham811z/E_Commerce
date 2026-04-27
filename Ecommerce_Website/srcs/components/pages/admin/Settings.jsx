import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { authApi } from '@/components/services/api';
import {
  MdSave, MdNotifications, MdSecurity, MdLanguage, MdPalette, MdSettings,
} from 'react-icons/md';

const SETTINGS_KEY = 'adminSettings';

function loadSettings() {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); } catch { return {}; }
}

function Toggle({ checked, onChange }) {
  return (
    <label className='relative inline-flex items-center cursor-pointer'>
      <input type='checkbox' className='sr-only peer' checked={checked} onChange={onChange} />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600" />
    </label>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className='block text-sm font-medium text-gray-700 mb-1'>{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const saved = loadSettings();

  // General
  const [general, setGeneral] = useState({
    storeName:    saved.storeName    || 'PC World Shop',
    contactEmail: saved.contactEmail || 'contact@pcworld.com',
    phone:        saved.phone        || '0123456789',
    address:      saved.address      || '227 Nguyễn Văn Cừ, Quận 5, TP.HCM',
  });

  // Notifications
  const [notifs, setNotifs] = useState({
    newOrder:     saved.newOrder     ?? true,
    emailNotifs:  saved.emailNotifs  ?? true,
    outOfStock:   saved.outOfStock   ?? false,
  });

  // Security
  const [security, setSecurity] = useState({ current: '', newPw: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);

  // Appearance
  const [appearance, setAppearance] = useState({
    color:  saved.color  || 'red',
    motion: saved.motion ?? true,
  });

  // Language
  const [lang, setLang] = useState({
    language:     saved.language     || 'vi',
    dateFormat:   saved.dateFormat   || 'dd/mm/yyyy',
    currencyFmt:  saved.currencyFmt  || 'vnd',
  });

  const persist = (patch) => {
    const next = { ...loadSettings(), ...patch };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  };

  const handleSaveGeneral = () => {
    persist(general);
    toast.success('Đã lưu cài đặt chung!');
  };

  const handleSaveNotifs = () => {
    persist(notifs);
    toast.success('Đã lưu cài đặt thông báo!');
  };

  const handleChangePassword = async () => {
    if (!security.current || !security.newPw || !security.confirm) {
      toast.error('Vui lòng điền đầy đủ các trường mật khẩu.');
      return;
    }
    if (security.newPw !== security.confirm) {
      toast.error('Mật khẩu mới không khớp.');
      return;
    }
    if (security.newPw.length < 8) {
      toast.error('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }
    setPwLoading(true);
    try {
      await authApi.post('/auth/change-password', {
        currentPassword: security.current,
        newPassword:     security.newPw,
      });
      setSecurity({ current: '', newPw: '', confirm: '' });
      toast.success('Mật khẩu đã được cập nhật!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cập nhật mật khẩu thất bại.');
    } finally {
      setPwLoading(false);
    }
  };

  const handleSaveAppearance = () => {
    persist(appearance);
    toast.success('Đã lưu cài đặt giao diện!');
  };

  const handleSaveLang = () => {
    persist(lang);
    toast.success('Đã lưu cài đặt ngôn ngữ!');
  };

  const tabs = [
    { id: 'general',       name: 'Cài đặt chung',   icon: <MdSettings /> },
    { id: 'notifications', name: 'Thông báo',        icon: <MdNotifications /> },
    { id: 'security',      name: 'Bảo mật',          icon: <MdSecurity /> },
    { id: 'appearance',    name: 'Giao diện',        icon: <MdPalette /> },
    { id: 'language',      name: 'Ngôn ngữ',         icon: <MdLanguage /> },
  ];

  const colors = ['red', 'blue', 'green', 'purple', 'yellow'];
  const colorMap = {
    red:    'bg-red-600',
    blue:   'bg-blue-600',
    green:  'bg-green-600',
    purple: 'bg-purple-600',
    yellow: 'bg-yellow-500',
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>Cài đặt hệ thống</h1>
        <p className='text-gray-600'>Quản lý cài đặt và tùy chỉnh hệ thống</p>
      </div>

      <div className='flex flex-col md:flex-row gap-6'>
        {/* Sidebar */}
        <div className='w-full md:w-64 shrink-0'>
          <div className='bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100'>
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`w-full flex items-center px-4 py-3 text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-red-50 text-red-600 border-l-4 border-red-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className='text-xl mr-3'>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className='flex-1'>
          <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>

            {/* General */}
            {activeTab === 'general' && (
              <div>
                <h2 className='text-lg font-semibold text-gray-800 mb-4'>Cài đặt chung</h2>
                <div className='space-y-4'>
                  <Field label='Tên cửa hàng'>
                    <input className={inputCls} value={general.storeName}
                      onChange={e => setGeneral(p => ({ ...p, storeName: e.target.value }))} />
                  </Field>
                  <Field label='Địa chỉ email liên hệ'>
                    <input type='email' className={inputCls} value={general.contactEmail}
                      onChange={e => setGeneral(p => ({ ...p, contactEmail: e.target.value }))} />
                  </Field>
                  <Field label='Số điện thoại'>
                    <input type='tel' className={inputCls} value={general.phone}
                      onChange={e => setGeneral(p => ({ ...p, phone: e.target.value }))} />
                  </Field>
                  <Field label='Địa chỉ'>
                    <textarea className={inputCls} rows='3' value={general.address}
                      onChange={e => setGeneral(p => ({ ...p, address: e.target.value }))} />
                  </Field>
                  <div className='pt-2'>
                    <button onClick={handleSaveGeneral}
                      className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2'>
                      <MdSave /> Lưu thay đổi
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className='text-lg font-semibold text-gray-800 mb-4'>Cài đặt thông báo</h2>
                <div className='space-y-5'>
                  {[
                    { key: 'newOrder',    label: 'Thông báo đơn hàng mới', desc: 'Nhận thông báo khi có đơn hàng mới' },
                    { key: 'emailNotifs', label: 'Thông báo email',        desc: 'Nhận thông báo qua email' },
                    { key: 'outOfStock',  label: 'Thông báo hết hàng',     desc: 'Nhận thông báo khi sản phẩm hết hàng' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className='flex items-center justify-between'>
                      <div>
                        <h3 className='font-medium text-gray-800'>{label}</h3>
                        <p className='text-sm text-gray-600'>{desc}</p>
                      </div>
                      <Toggle checked={notifs[key]} onChange={e => setNotifs(p => ({ ...p, [key]: e.target.checked }))} />
                    </div>
                  ))}
                  <div className='pt-2'>
                    <button onClick={handleSaveNotifs}
                      className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2'>
                      <MdSave /> Lưu thay đổi
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <div>
                <h2 className='text-lg font-semibold text-gray-800 mb-4'>Đổi mật khẩu</h2>
                <div className='space-y-4 max-w-md'>
                  <Field label='Mật khẩu hiện tại'>
                    <input type='password' className={inputCls} value={security.current}
                      onChange={e => setSecurity(p => ({ ...p, current: e.target.value }))} />
                  </Field>
                  <Field label='Mật khẩu mới'>
                    <input type='password' className={inputCls} value={security.newPw}
                      onChange={e => setSecurity(p => ({ ...p, newPw: e.target.value }))}
                      placeholder='Ít nhất 8 ký tự' />
                  </Field>
                  <Field label='Xác nhận mật khẩu mới'>
                    <input type='password' className={inputCls} value={security.confirm}
                      onChange={e => setSecurity(p => ({ ...p, confirm: e.target.value }))} />
                  </Field>
                  <div className='pt-2'>
                    <button onClick={handleChangePassword} disabled={pwLoading}
                      className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center gap-2'>
                      <MdSave /> {pwLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance */}
            {activeTab === 'appearance' && (
              <div>
                <h2 className='text-lg font-semibold text-gray-800 mb-4'>Cài đặt giao diện</h2>
                <div className='space-y-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-3'>Màu chính</label>
                    <div className='flex gap-3'>
                      {colors.map(c => (
                        <button key={c} onClick={() => setAppearance(p => ({ ...p, color: c }))}
                          className={`w-8 h-8 rounded-full ${colorMap[c]} ${
                            appearance.color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                          } transition-all`} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-3'>Hiệu ứng chuyển động</label>
                    <div className='flex gap-4'>
                      {[{ v: true, l: 'Bật' }, { v: false, l: 'Tắt' }].map(({ v, l }) => (
                        <label key={l} className='inline-flex items-center cursor-pointer'>
                          <input type='radio' name='motion' className='h-4 w-4 text-red-600'
                            checked={appearance.motion === v}
                            onChange={() => setAppearance(p => ({ ...p, motion: v }))} />
                          <span className='ml-2 text-gray-800'>{l}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className='pt-2'>
                    <button onClick={handleSaveAppearance}
                      className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2'>
                      <MdSave /> Lưu thay đổi
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Language */}
            {activeTab === 'language' && (
              <div>
                <h2 className='text-lg font-semibold text-gray-800 mb-4'>Cài đặt ngôn ngữ</h2>
                <div className='space-y-4 max-w-sm'>
                  <Field label='Ngôn ngữ hiển thị'>
                    <select className={inputCls} value={lang.language}
                      onChange={e => setLang(p => ({ ...p, language: e.target.value }))}>
                      <option value='vi'>Tiếng Việt</option>
                      <option value='en'>English</option>
                      <option value='ja'>日本語</option>
                      <option value='ko'>한국어</option>
                    </select>
                  </Field>
                  <Field label='Định dạng ngày'>
                    <select className={inputCls} value={lang.dateFormat}
                      onChange={e => setLang(p => ({ ...p, dateFormat: e.target.value }))}>
                      <option value='dd/mm/yyyy'>DD/MM/YYYY</option>
                      <option value='mm/dd/yyyy'>MM/DD/YYYY</option>
                      <option value='yyyy/mm/dd'>YYYY/MM/DD</option>
                    </select>
                  </Field>
                  <Field label='Định dạng tiền tệ'>
                    <select className={inputCls} value={lang.currencyFmt}
                      onChange={e => setLang(p => ({ ...p, currencyFmt: e.target.value }))}>
                      <option value='vnd'>VND (₫)</option>
                      <option value='usd'>USD ($)</option>
                      <option value='eur'>EUR (€)</option>
                    </select>
                  </Field>
                  <div className='pt-2'>
                    <button onClick={handleSaveLang}
                      className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2'>
                      <MdSave /> Lưu thay đổi
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
