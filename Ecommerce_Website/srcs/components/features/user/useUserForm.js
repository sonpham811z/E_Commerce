import { useEffect, useState } from "react";
import { useUser } from "./UserContext";

export function useUserForm() {
  const { userInfo, setUserInfo } = useUser();
  const currentYear = new Date().getFullYear();
  const [days, setDays] = useState([]);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: currentYear - 1949 }, (_, i) => 1950 + i);

  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    phone: "",
    email: "",
    day: "",
    month: "",
    year: "",
  });

  const isLeapYear = (year) =>
    (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

  useEffect(() => {
    if (userInfo) {
      setFormData({
        fullName: userInfo.fullName || "",
        gender: userInfo.gender || "",
        phone: userInfo.phone || "",
        email: userInfo.email || "",
        day: userInfo.dob?.day || "",
        month: userInfo.dob?.month || "",
        year: userInfo.dob?.year || "",
      });

      const m = Number(userInfo.dob?.month);
      const y = Number(userInfo.dob?.year);
      if (m && y) {
        const daysInMonth = [
          31,
          isLeapYear(y) ? 29 : 28,
          31,
          30,
          31,
          30,
          31,
          31,
          30,
          31,
          30,
          31,
        ];
        setDays(Array.from({ length: daysInMonth[m - 1] }, (_, i) => i + 1));
      }
    }
  }, [userInfo]);

  useEffect(() => {
    const month = Number(formData.month);
    const year = Number(formData.year);
    if (month && year) {
      const daysInMonth = [
        31,
        isLeapYear(year) ? 29 : 28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31,
      ];
      setDays(Array.from({ length: daysInMonth[month - 1] }, (_, i) => i + 1));
    }
  }, [formData.month, formData.year]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e, navigate) => {
    e.preventDefault();
    setUserInfo({
      fullName: formData.fullName,
      gender: formData.gender,
      phone: formData.phone,
      email: formData.email,
      dob: {
        day: formData.day,
        month: formData.month,
        year: formData.year,
      },
    });
    navigate("/user");
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    days,
    months,
    years,
  };
}
