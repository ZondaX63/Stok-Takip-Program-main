import React from 'react';
import {
    Menu as MenuIcon,
    Notifications,
    Search
} from '@mui/icons-material';

const Topbar = ({ toggleSidebar }) => {
    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-20 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-20">
            <div className="flex items-center">
                <button onClick={toggleSidebar} className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden">
                    <MenuIcon />
                </button>
                <div className="hidden md:flex ml-4 relative w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-4 py-2.5 border-none rounded-xl bg-slate-100 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 sm:text-sm"
                        placeholder="Hızlı arama yapın..."
                    />
                </div>
            </div>
            <div className="flex items-center space-x-6">
                <button className="relative p-2 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors focus:outline-none">
                    <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                    <Notifications />
                </button>
                <div className="flex items-center pl-6 border-l border-slate-200">
                    <div className="flex flex-col items-end mr-3 hidden md:flex">
                        <span className="text-sm font-semibold text-slate-700">ZondaX Kullanıcısı</span>
                        <span className="text-xs text-slate-500">Yönetici</span>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30 ring-2 ring-white cursor-pointer">
                        ZK
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
