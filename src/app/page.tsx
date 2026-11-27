'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { AddTransactionModal } from '@/components/modals/AddTransactionModal';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { TransactionsView } from '@/components/transactions/TransactionsView';
import { BudgetView } from '@/components/budget/BudgetView';
import { SavingsView } from '@/components/savings/SavingsView';
import { BillsView } from '@/components/bills/BillsView';
import { ReportsView } from '@/components/reports/ReportsView';
import { SettingsView } from '@/components/settings/SettingsView';
import { LandingPage } from '@/components/landing/LandingPage';

export default function Home() {
  const { isLoggedIn, activeTab } = useFinance();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);

  // If user is not logged in, show landing page
  if (!isLoggedIn) {
    return <LandingPage />;
  }

  // Render view based on active navigation tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onOpenAddTx={() => setIsAddTxModalOpen(true)} />;
      case 'transactions':
        return <TransactionsView onOpenAddTx={() => setIsAddTxModalOpen(true)} />;
      case 'budgets':
        return <BudgetView />;
      case 'savings':
        return <SavingsView />;
      case 'bills':
        return <BillsView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onOpenAddTx={() => setIsAddTxModalOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <Sidebar
        isOpenMobile={isMobileSidebarOpen}
        setIsOpenMobile={setIsMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        <Navbar
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenAddTxModal={() => setIsAddTxModalOpen(true)}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {renderContent()}
        </main>
      </div>

      {/* Global Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddTxModalOpen}
        onClose={() => setIsAddTxModalOpen(false)}
      />
    </div>
  );
}
