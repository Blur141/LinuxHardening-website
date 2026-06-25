'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { WelcomeScreen } from '@/components/hardening/WelcomeScreen';
import { CategoryView } from '@/components/hardening/CategoryView';
import { getCategoryData } from '@/data/hardening';
import { getDistro, getVersion } from '@/data/distributions';
import type { CategoryId, DistroId } from '@/types';
import { cn } from '@/lib/utils';

export default function Home() {
  const [selectedDistro, setSelectedDistro] = useState<DistroId | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const distro = selectedDistro ? getDistro(selectedDistro) : null;
  const version = distro && selectedVersion ? getVersion(selectedDistro!, selectedVersion) : null;

  const handleDistroChange = (id: DistroId) => {
    setSelectedDistro(id);
    const d = getDistro(id);
    if (d) {
      const v = d.versions.find((ver) => !ver.eol) ?? d.versions[0];
      setSelectedVersion(v.id);
    }
    setSelectedCategory(null);
  };

  const handleQuickStart = (distroId: DistroId, categoryId: CategoryId) => {
    const d = getDistro(distroId);
    if (!d) return;
    const v = d.versions.find((ver) => !ver.eol) ?? d.versions[0];
    setSelectedDistro(distroId);
    setSelectedVersion(v.id);
    setSelectedCategory(categoryId);
    setMobileSidebarOpen(false);
  };

  const categoryData =
    distro && selectedCategory
      ? getCategoryData(selectedCategory, distro)
      : null;

  const showContent = selectedDistro && selectedVersion && selectedCategory && categoryData;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        onMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        menuOpen={mobileSidebarOpen}
      />

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 mx-auto w-full max-w-screen-2xl">
        {/* Desktop sidebar */}
        <div className="hidden lg:block border-r border-border/50 bg-background/30 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
          <Sidebar
            selectedDistro={selectedDistro}
            selectedVersion={selectedVersion}
            selectedCategory={selectedCategory}
            onDistroChange={handleDistroChange}
            onVersionChange={setSelectedVersion}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Mobile sidebar */}
        <div
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-72 transform bg-background border-r border-border transition-transform duration-200 ease-in-out lg:hidden',
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="h-14 border-b border-border/50 flex items-center px-4">
            <span className="font-semibold text-sm">Navigation</span>
          </div>
          <div className="overflow-y-auto h-[calc(100%-3.5rem)]">
            <Sidebar
              selectedDistro={selectedDistro}
              selectedVersion={selectedVersion}
              selectedCategory={selectedCategory}
              onDistroChange={handleDistroChange}
              onVersionChange={setSelectedVersion}
              onCategoryChange={(id) => {
                setSelectedCategory(id);
                setMobileSidebarOpen(false);
              }}
              mobile
              onClose={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6">
          {showContent ? (
            <CategoryView
              data={categoryData}
              distroName={distro!.name}
              versionName={version?.name ?? selectedVersion ?? ''}
            />
          ) : (
            <WelcomeScreen
              onDistroSelect={handleDistroChange}
              onQuickStart={handleQuickStart}
            />
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
