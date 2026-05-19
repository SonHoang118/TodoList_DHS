import React, { useState } from "react";

export interface HeaderProps {
  goToToday: () => void;
  moveWeek: (amount: number) => void;
  headerTitle: string;
  onCurrentUserChange: (user: { id: number; fullName: string } | null) => void;
  onCreateClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ goToToday, moveWeek, headerTitle, onCurrentUserChange, onCreateClick }) => {

  const [users, setUsers] = useState<{ id: number; fullName: string }[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: number; fullName: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  // Load users from API
  React.useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
      if (!currentUser && data.length > 0) {
        setCurrentUser(data[0]);
        onCurrentUserChange(data[0]);
      }
    };
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onCurrentUserChange]);

  React.useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      const dropdown = document.getElementById("user-dropdown") || document.getElementById("user-dropdown-mobile");
      const toggleBtnDesktop = document.getElementById("user-dropdown-toggle-desktop");
      const toggleBtnMobile = document.getElementById("user-dropdown-toggle-mobile");
      if (
        dropdown && !dropdown.contains(e.target as Node) &&
        (!toggleBtnDesktop || !toggleBtnDesktop.contains(e.target as Node)) &&
        (!toggleBtnMobile || !toggleBtnMobile.contains(e.target as Node))
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  const addUser = async () => {
    const fullName = prompt("Nhập Họ và Tên người dùng mới:");
    if (fullName) {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName }),
      });
      if (res.ok) {
        const newUser = await res.json();
        setUsers((prev) => [...prev, newUser]);
        setCurrentUser(newUser);
        onCurrentUserChange(newUser);
      } else {
        alert("Không thể thêm người dùng!");
      }
    }
  };

  return (
    <header className="border-b border-[#e0e0e0] bg-[#f1f3f4]">
      {/* Mobile: hàng chọn thành viên + nút Tạo */}
      <div className="flex items-center gap-2 px-3 py-2 md:hidden border-b border-[#e0e0e0]">
        <div className="relative flex flex-1">
          <div
            id="user-dropdown-toggle-mobile"
            className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm cursor-pointer flex-1"
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            <div className="h-7 w-7 rounded-full bg-[#d1d5db] flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill="#9ca3af"/><path d="M4 20c0-2.21 3.582-4 8-4s8 1.79 8 4" fill="#d1d5db"/></svg>
            </div>
            <span className="text-sm font-medium truncate flex-1">{currentUser ? currentUser.fullName : "Chọn thành viên"}</span>
            <svg className={`w-4 h-4 flex-shrink-0 transition-transform ${dropdownOpen ? "rotate-180" : "rotate-0"}`} fill="none" stroke="#6b7280" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
          </div>
          {dropdownOpen && (
            <div id="user-dropdown-mobile" className="absolute left-0 top-full z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-xl" style={{ pointerEvents: 'auto' }}>
              <ul className="max-h-56 overflow-y-auto py-2">
                {users.map((user) => (
                  <li
                    key={user.id}
                    className={`flex items-center gap-2 px-4 py-2 cursor-pointer transition-colors rounded-md mx-2 mb-1 ${currentUser && user.id === currentUser.id ? "bg-blue-100 text-blue-700 font-semibold" : "hover:bg-gray-100"}`}
                    onClick={() => {
                      setCurrentUser(user);
                      onCurrentUserChange(user);
                      setDropdownOpen(false);
                    }}
                  >
                    <div className="h-7 w-7 rounded-full bg-[#d1d5db] flex items-center justify-center">
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill="#9ca3af"/><path d="M4 20c0-2.21 3.582-4 8-4s8 1.79 8 4" fill="#d1d5db"/></svg>
                    </div>
                    <span className="truncate">{user.fullName}</span>
                    {currentUser && user.id === currentUser.id && (
                      <svg className="ml-auto w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                    )}
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-200 px-2 py-2">
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                  onClick={() => { setDropdownOpen(false); addUser(); }}
                >
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#3b82f6" strokeWidth="2"/><path d="M12 8v8M8 12h8" stroke="#3b82f6" strokeWidth="2"/></svg>
                  Thêm thành viên
                </button>
              </div>
            </div>
          )}
        </div>
        {onCreateClick && (
          <button
            type="button"
            onClick={onCreateClick}
            className="inline-flex items-center gap-1 rounded-2xl border border-[#dadce0] bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-[#fafafa] flex-shrink-0"
          >
            <span className="text-xl leading-none">+</span>
            Tạo
          </button>
        )}
      </div>
      <div className="mx-auto flex h-18 max-w-400 items-center gap-4 px-3 md:px-6">
        <div className="relative hidden md:flex">
          <div
            id="user-dropdown-toggle-desktop"
            className="flex items-center gap-2 rounded-full bg-white px-2 py-1.5 md:px-3 md:py-2 shadow-sm cursor-pointer min-w-[36px] md:min-w-[140px]"
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            <div className="h-8 w-8 rounded-full bg-[#d1d5db] flex items-center justify-center">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill="#9ca3af"/><path d="M4 20c0-2.21 3.582-4 8-4s8 1.79 8 4" fill="#d1d5db"/></svg>
            </div>
            <span className="hidden md:inline text-sm font-medium truncate max-w-[80px]">{currentUser ? currentUser.fullName : ""}</span>
            <svg className={`hidden md:block ml-1 w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : "rotate-0"}`} fill="none" stroke="#6b7280" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
          </div>
          {dropdownOpen && (
            <div id="user-dropdown" className="absolute left-0 top-full z-10 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-xl animate-fadeIn">
              <ul className="max-h-60 overflow-y-auto py-2">
                {users.map((user) => (
                  <li
                    key={user.id}
                    className={`flex items-center gap-2 px-4 py-2 cursor-pointer transition-colors rounded-md mx-2 mb-1 ${currentUser && user.id === currentUser.id ? "bg-blue-100 text-blue-700 font-semibold" : "hover:bg-gray-100"}`}
                    onClick={() => {
                      setCurrentUser(user);
                      onCurrentUserChange(user);
                      setDropdownOpen(false);
                    }}
                  >
                    <div className="h-7 w-7 rounded-full bg-[#d1d5db] flex items-center justify-center">
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill="#9ca3af"/><path d="M4 20c0-2.21 3.582-4 8-4s8 1.79 8 4" fill="#d1d5db"/></svg>
                    </div>
                    <span className="truncate">{user.fullName}</span>
                    {currentUser && user.id === currentUser.id && (
                      <svg className="ml-auto w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                    )}
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-200 mt-1 pt-1 px-2 pb-2">
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                  onClick={() => {
                    setDropdownOpen(false);
                    addUser();
                  }}
                >
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#3b82f6" strokeWidth="2"/><path d="M12 8v8M8 12h8" stroke="#3b82f6" strokeWidth="2"/></svg>
                  Thêm thành viên
                </button>
              </div>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={goToToday}
          className="rounded-full border border-[#b6b6b6] px-5 py-2 text-sm font-semibold hover:bg-white"
        >
          Hôm nay
        </button>
        <button
          type="button"
          onClick={() => moveWeek(-1)}
          className="text-xl text-[#5f6368]"
        >
          &#8249;
        </button>
        <button
          type="button"
          onClick={() => moveWeek(1)}
          className="text-xl text-[#5f6368]"
        >
          &#8250;
        </button>
        <h1 className="ml-1 text-lg font-semibold md:text-[2rem]">{headerTitle}</h1>
        <div className="ml-auto flex items-center gap-3 text-[#5f6368]">
          <span className="text-lg">&#9906;</span>
          <span className="text-lg">?</span>
          <span className="text-lg">&#9881;</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
