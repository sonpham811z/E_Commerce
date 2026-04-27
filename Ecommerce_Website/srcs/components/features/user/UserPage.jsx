import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";
import Spinner from "../../ui/Spinner";
import { FaUser, FaPhone, FaEnvelope, FaCalendarAlt, FaVenusMars } from "react-icons/fa";

function InfoCard({ icon, label, value }) {
  return (
    <div className="flex flex-col bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 h-full">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
          {icon}
        </div>
        <span className="text-gray-500 font-medium">{label}</span>
      </div>
      <p className="text-gray-800 font-semibold text-lg ml-1">{value || "—"}</p>
    </div>
  );
}

function UserPage() {
  const navigate = useNavigate();

  const { userInfo } = useUser();
  if (!userInfo) return <Spinner />;

  return (
    <div className="flex-1 bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6 text-white">
        <h2 className="text-2xl font-bold">Thông tin tài khoản</h2>
        <p className="text-red-100 mt-1">Quản lý thông tin cá nhân của bạn</p>
      </div>

      {/* Profile info */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoCard 
            icon={<FaUser />} 
            label="Họ tên" 
            value={userInfo.fullName}
          />
          
          <InfoCard 
            icon={<FaVenusMars />} 
            label="Giới tính" 
            value={userInfo.gender}
          />
          
          <InfoCard 
            icon={<FaPhone />} 
            label="Số điện thoại" 
            value={userInfo.phone}
          />
          
          <InfoCard 
            icon={<FaEnvelope />} 
            label="Email" 
            value={userInfo.email}
          />
          
          <InfoCard 
            icon={<FaCalendarAlt />} 
            label="Ngày sinh" 
            value={userInfo.dob?.day && userInfo.dob?.month && userInfo.dob?.year ? 
              `${userInfo.dob.day}/${userInfo.dob.month}/${userInfo.dob.year}` : 
              "Chưa thiết lập"}
          />
        </div>

        {/* Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => navigate("/user/update")}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Cập nhật thông tin
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserPage;
